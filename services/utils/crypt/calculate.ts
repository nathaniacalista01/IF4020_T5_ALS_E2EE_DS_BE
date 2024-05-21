export const operatorXOR = (block1: string, block2: string): string => {
  // Assume block1.length = block2.length
  let resBlock = ''
  for (let i = 0; i < block1.length; i++) {
    const charBinary1 = parseInt(block1[i])
    const charBinary2 = parseInt(block2[i])
    const resChar = (charBinary1 ^ charBinary2).toString()

    // var charBinary1 = block1[i];
    // var charBinary2 = block2[i];
    // var resChar = (charBinary1 == charBinary2) ? "0" : "1"

    resBlock += resChar
  }
  return resBlock
}

export const splitBlock = (size: number, block: string) => {
  const result = []
  for (let i = 0; i < block.length; i += size) {
    const subBlock = block.slice(i, i + size)
    result.push(subBlock)
  }
  return result
}

export const generateIV = () => {
  return '0101111000100101010000110100100100100000100100010010000101001000'.repeat(
    2,
  )
}

// export const shiftLeft = (block : string, shift : number) =>{
//   const value = block.substring(0, shift)
//   block = block.slice(shift)
//   return block += value
// }
