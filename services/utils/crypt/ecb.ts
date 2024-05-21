import { JNN } from './jnn'

export const encryptECB = (
  arrBlocks: Array<string>,
  key: string,
): Array<string> => {
  const res: Array<string> = []
  const jnn = new JNN()
  for (let i = 0; i < arrBlocks.length; i++) {
    const currentBlock = arrBlocks[i]
    const encryptedBlock = jnn.encrypt(currentBlock, key)
    res.push(encryptedBlock)
  }

  return res
}

export const decryptECB = (
  arrBlocks: Array<string>,
  key: string,
): Array<string> => {
  const res: Array<string> = []
  const jnn = new JNN()

  for (let i = 0; i < arrBlocks.length; i++) {
    const currentBlock = arrBlocks[i]
    const decryptedBlock = jnn.decrypt(currentBlock, key)
    res.push(decryptedBlock)
  }

  return res
}
