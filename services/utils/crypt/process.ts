import { BLOCK_SIZE, BYTE_SIZE, KEY_BLOCK_SIZE } from '../constants/crypto'

export const makeStringToBlocksArray = (text: string, isKey: boolean) => {
  const increment = isKey ? KEY_BLOCK_SIZE : BLOCK_SIZE
  const blocks = []
  for (let i = 0; i < text.length; i += increment) {
    const block = text.slice(i, i + increment)
    const binaryBlock = block
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(BYTE_SIZE, '0'))
      .join('')
    blocks.push(binaryBlock)
  }
  return blocks
}

export const makeBlocksArrayToString = (blocks: Array<string>) => {
  let string = ''
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    for (let i = 0; i < block.length; i += BYTE_SIZE) {
      const charBinary = block.slice(i, i + BYTE_SIZE)
      const char = String.fromCharCode(parseInt(charBinary, 2))
      string += char
    }
  }
  return string
}

export const adjustKey = (key: string) => {
  if (key.length == KEY_BLOCK_SIZE) {
    return key
  } else if (key.length < KEY_BLOCK_SIZE) {
    return key.padEnd(KEY_BLOCK_SIZE, '0')
  } else {
    return key.slice(0, KEY_BLOCK_SIZE)
  }
}

export const adjustText = (text: string) => {
  const divider = Math.ceil(text.length / BLOCK_SIZE)
  const res = text.padEnd(divider * BLOCK_SIZE, ' ')
  return res
}
