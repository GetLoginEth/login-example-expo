import {
  Alert,
  Button,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native'
import { Text, View } from '../components/Themed'
import { RootTabScreenProps } from '../types'
import { useEffect, useState } from 'react'
import { getData, saveData } from '../utils/storage'
import { AccountInfo, createNote, getAccountInfo, getNotes, Note } from '../utils/crypto'

export const getLoginUrlIOS = 'https://apps.apple.com/tr/app/facebook/id6444726873'
export const getLoginUrlAndroid = 'https://play.google.com/store/apps/details?id=com.shadurin.getloginmobile'
export const getLoginAuthorizeUrl = 'getlogin://dapp-authorize?applicationId=3'

export default function TabOneScreen({ route }: RootTabScreenProps<'TabOne'>) {
  const [refreshing, setRefreshing] = useState(false)
  const [logged, setLogged] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [accountInfo, setAccountInfo] = useState<AccountInfo>()
  const [notes, setNotes] = useState<Note[]>([])

  const onRefresh = async () => {
    if (!accountInfo) {
      setError('Application session is not created for notes retrieving')

      return
    }

    setRefreshing(true)
    try {
      setNotes(await getNotes(accountInfo.usernameHash, accountInfo.wallet))
    } catch (e) {
      setUnknownError(e)
    }

    setRefreshing(false)
  }

  const setUnknownError = (e: unknown) => {
    const error = e as Error
    setError(error.message.substring(0, 255))
  }

  const initAccount = async (privateKey: string, username: string) => {
    try {
      setAccountInfo(await getAccountInfo(privateKey, username))
      setLogged(true)
      await saveData(privateKey, username)
    } catch (e) {
      setUnknownError(e)
    }
  }

  useEffect(() => {
    async function run() {
      let localData
      try {
        localData = await getData()
      } catch (e) {
        return
      }

      await initAccount(localData.privateKey, localData.username)
    }

    run().then()
  }, [])

  useEffect(() => {
    if (!accountInfo) {
      return
    }

    onRefresh().then()
  }, [accountInfo])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const params = route?.params?.params

    if (!params) {
      return
    }

    const { privateKey, username } = params
    initAccount(privateKey, username).then()
  }, [route])

  console.log('route', route)

  return (
    <View style={styles.container}>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {logged && accountInfo ? (
        <Logged
          status={status}
          onLogout={async () => {
            await saveData('', '')
            setLogged(false)
          }}
          createNote={async (text: string) => {
            try {
              setStatus('Sending transaction...')
              const tx = await createNote(text, accountInfo!.wallet)
              setStatus('Waiting 1 confirmation...')
              await tx.wait(1)
              setStatus('Sent!')
              await onRefresh()
            } catch (e) {
              setUnknownError(e)
            }
          }}
          username={accountInfo.username}
          notes={notes}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      ) : (
        <NotLogged />
      )}
    </View>
  )
}

export function NotLogged() {
  return (
    <>
      <Text style={[styles.title]}>Welcome to public Notes!</Text>
      <Text style={[styles.text]}>
        This application allows you to store public notes directly on the Gnosis Chain blockchain. To perform
        transactions with the blockchain, you need to log in to your GetLogin account. If you have enough funds on your
        account, then you can save notes.
      </Text>
      <Text style={[styles.title]}>Step 1</Text>
      <Text style={[styles.title2]}>Install GetLogin</Text>
      <Button
        title="Install"
        onPress={async () => Linking.openURL(Platform.OS === 'ios' ? getLoginUrlIOS : getLoginUrlAndroid)}
      />
      <Text style={[styles.title]}>Step 2</Text>
      <Text style={[styles.title2]}>Authorize with GetLogin</Text>
      <Button title="Authorize" onPress={async () => Linking.openURL(getLoginAuthorizeUrl)} />
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function Logged({ username, notes, onRefresh, refreshing, createNote, onLogout, status }) {
  const [creating, setCreating] = useState(false)
  const [note, setNote] = useState('')

  const createAlert = () =>
    Alert.alert('Confirmation', 'Really Logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => onLogout(),
      },
    ])

  return (
    <>
      <SafeAreaView>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <Text style={[styles.title]}>
            Hey, {username}{' '}
            <Text onPress={() => createAlert()} style={[styles.title, { color: 'blue' }]}>
              Logout?
            </Text>
          </Text>
          {status && <Text style={{ marginTop: 5, marginBottom: 5 }}>{status}</Text>}
          <TextInput
            style={styles.input}
            onChangeText={data => setNote(data)}
            value={note}
            placeholder="Your text here"
            editable={!creating}
          />
          <Button
            title="Create a note"
            disabled={note.trim().length === 0 || creating}
            onPress={async () => {
              setCreating(true)
              try {
                await createNote(note.trim())
                setNote('')
              } catch (e) {
              } finally {
                setCreating(false)
              }
            }}
          />
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          {notes.length === 0 ? <NotesNotFound /> : <Notes notes={notes} />}
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

export function NotesNotFound() {
  return <Text style={[styles.text]}>Notes not found</Text>
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function Notes({ notes }) {
  return (
    <View>
      {[...notes].reverse().map((item: any) => (
        <View key={item.text}>
          <Text>{item.text}</Text>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    padding: '5%',
  },
  text: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
