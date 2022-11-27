import { Contract, ContractTransaction, providers, utils, Wallet } from 'ethers'
import notesAbi from '../data/notes/abi.json'
import storageAbi from '../data/getlogin/storage/abi.json'

export interface AccountInfo {
  privateKey: string
  wallet: Wallet
  username: string
  usernameHash: string
}

export interface Note {
  text: string
}

export const xDaiRpc = 'https://xdai.fairdatasociety.org'
export const notesAddress = '0xf6b270136Da7F8a2113B93a3b9Eeaf5160C45bA0'

export function getUsernameHash(username: string): string {
  return utils.keccak256(utils.toUtf8Bytes(username))
}

export function getNotesContract(signer: Wallet): Contract {
  return new Contract(notesAddress, notesAbi, signer)
}

export function getStorageContract(signer: Wallet): Contract {
  return new Contract(storageAbi.networks[100].address, storageAbi.abi, signer)
}

/**
 * Sends notes to Notes smart contract
 */
export async function createNote(text: string, signer: Wallet): Promise<ContractTransaction> {
  const contract = getNotesContract(signer)

  return contract.functions.createNote(text)
}

/**
 * Gets notes from Notes smart contract
 * @param usernameHash
 * @param signer
 */
export async function getNotes(usernameHash: string, signer: Wallet): Promise<Note[]> {
  const contract = getNotesContract(signer)

  return (await contract.callStatic.getNotes(usernameHash)).map((item: any) => ({
    text: item[2],
  }))
}

/**
 * Gets username hash of the account by session wallet address
 */
export async function getUsernameHashByAddress(address: string, signer: Wallet): Promise<string> {
  const contract = getStorageContract(signer)
  const response = await contract.callStatic.UsersAddressUsername(address)

  if (response.length > 0) {
    if (response[1] === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      throw new Error(`User assigned to the address ${address} not found`)
    }

    return response[1]
  } else {
    throw new Error('User not found in GetLogin contract by session address')
  }
}

export async function getAccountInfo(privateKey: string, username: string): Promise<AccountInfo> {
  const wallet = new Wallet(privateKey).connect(new providers.JsonRpcProvider(xDaiRpc))
  const usernameHash = await getUsernameHashByAddress(wallet.address, wallet)

  if (getUsernameHash(username) !== usernameHash) {
    throw new Error('The hash of the received username does not match the hash from the GetLogin smart contract')
  }

  return {
    privateKey,
    wallet,
    username,
    usernameHash,
  }
}
