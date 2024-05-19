import { operatorXOR } from "../utils/functions";

const BLOCK_SIZE = 16; // 128 bits = 16 bytes
const KEY_BLOCK_SIZE = 16; // 128 bits = 16 bytes
const BYTE_SIZE = 8 

class ECB {
  private plainText : string
  private cipherText : string
  private key : string

  constructor(key: string) {
    // Only set the key, because the use of ECB may vary (to decrypt with cipher or to encrypt with plain)
    this.plainText = ""
    this.cipherText = ""
    this.key = key
  }

  public setPlainText = (text: string) => {
    this.plainText = text
  }

  public setCipherText = (text: string) => {
    this.cipherText = text
  }

  public getKey = () => {
    return this.key
  }

  public getPlainText = () => {
    return this.plainText
  }

  public getcipherText = () => {
    return this.cipherText
  }

  private makeStringToBlocksArray = (text: string, isKey: boolean) => {
    var increment = isKey ? KEY_BLOCK_SIZE : BLOCK_SIZE;
    var blocks = [];
    for (let i = 0; i < text.length; i += increment) {
      const block = text.slice(i, i + increment);
      const binaryBlock = block
        .split("")
        .map((char) => char.charCodeAt(0).toString(2).padStart(BYTE_SIZE, "0"))
        .join("");
      blocks.push(binaryBlock);
    }
    return blocks;
  };

  private makeBlocksArrayToString = (blocks: Array<string>) => {
    var string = "";
    for (let i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      for (let i = 0; i < block.length; i += BYTE_SIZE) {
        const charBinary = block.slice(i, i + BYTE_SIZE);
        const char = String.fromCharCode(parseInt(charBinary, 2));
        string += char;
      }
    }
    return string;
  };

  private adjustText = (text: string) => {
    var divider = Math.ceil(text.length / BLOCK_SIZE);
    var res = text.padEnd(divider * BLOCK_SIZE, " ");
    return res;
  };

  
  private adjustKey = (key: string) => {
    if (key.length == KEY_BLOCK_SIZE) {
      return key;
    } else if (key.length < KEY_BLOCK_SIZE) {
      return key.padEnd(KEY_BLOCK_SIZE, "0");
    } else {
      return key.slice(0, KEY_BLOCK_SIZE);
    }
  };

  public encrypt = ()  : string => {
    if (this.plainText.length != 0){
      const adjustedPlain = this.adjustText(this.plainText)
      const adjustedKey = this.adjustKey(this.key)
      var textBlocks = this.makeStringToBlocksArray(adjustedPlain, false);
      var keyBlock = this.makeStringToBlocksArray(adjustedKey, true)[0];

      const res: Array<string> = [];
      for (let i = 0; i < textBlocks.length; i++) {
        const currentBlock = textBlocks[i];
        const encryptedBlock = operatorXOR(currentBlock, keyBlock);
        res.push(encryptedBlock);
      }

      const cipherText = this.makeBlocksArrayToString(res);
      this.cipherText = this.cipherText
      return this.cipherText;
    } else {
      throw new Error("Plain text is empty!")
    }
  }

  public decrypt = () : string => {
    if (this.cipherText.length != 0){
      const adjustedCipher = this.adjustText(this.cipherText)
      const adjustedKey = this.adjustKey(this.key)
      var textBlocks = this.makeStringToBlocksArray(adjustedCipher, false);
      var keyBlock = this.makeStringToBlocksArray(adjustedKey, true)[0];

      const res: Array<string> = [];
      for (let i = 0; i < textBlocks.length; i++) {
        const currentBlock = textBlocks[i];
        const decryptedBlock = operatorXOR(currentBlock, keyBlock);
        res.push(decryptedBlock);
      }

      const plainText = this.makeBlocksArrayToString(res);
      this.plainText = this.plainText
      return this.plainText;
    } else {
      throw new Error("Cipher text is empty!")
    }
  }


}