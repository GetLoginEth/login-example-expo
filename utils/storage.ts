import AsyncStorage from '@react-native-async-storage/async-storage'

export const APP_PRIVATE_KEY = 'app_private_key'
export const APP_USERNAME = 'app_username'

export interface LocalData {
  privateKey: string
  username: string
}

export async function saveData(privateKey: string, username: string) {
  return AsyncStorage.multiSet([
    [APP_PRIVATE_KEY, privateKey],
    [APP_USERNAME, username],
  ])
}

export async function getData(): Promise<LocalData> {
  const data = await AsyncStorage.multiGet([APP_PRIVATE_KEY, APP_USERNAME])
  const privateKey = data[0][1]
  const username = data[1][1]

  if (!(privateKey && username)) {
    throw new Error('Local saved privateKey or username is empty')
  }

  return {
    privateKey,
    username,
  }
}
