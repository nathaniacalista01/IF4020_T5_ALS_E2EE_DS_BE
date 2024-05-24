import crypto from 'crypto'
import clientKeys from '../globals/clientKeyMap'
import { eccBase } from '../services/type/eccBase'
import { ECDH } from '../services/class/ECDH'
import { makeNumToHex } from '../services/utils/functions'
import { generatePrimeNumber } from '../services/utils/number'
import { Point } from '../services/type/point'

export function generateSharedKey(clientPort: number, clientPublicKeyHex: any, clientECCData : eccBase) {
  
   // ECDH Key Generator
  // const ecdh = crypto.createECDH('secp256k1')
  const ecdh = new ECDH()
  // ecdh.generateKeys()
  const serverPrivateKey = makeNumToHex(generatePrimeNumber()) 
  // const serverPrivateKey = 999999
  ecdh.setValue(clientECCData.a, clientECCData.b, clientECCData.p)
  const basePoint = new Point(0,0)
  basePoint.setPointValue(clientECCData.pointVal)
  ecdh.setBasePoint(basePoint)

  // const publicKey = ecdh.getPublicKey().toString('hex')
  const publicKeyPoint = ecdh.multiplyPoint(basePoint, serverPrivateKey)
  const publicKey = publicKeyPoint.getPointValue()
  
  // const clientPublicKey = Buffer.from(clientPublicKeyHex, 'hex')
  const clientPublicKey = clientPublicKeyHex
  const clientPublicKeyPoint = new Point(0,0)
  clientPublicKeyPoint.setPointValue(clientPublicKey)

  const sharedKeyPoint = ecdh.multiplyPoint(clientPublicKeyPoint, serverPrivateKey)
  const sharedKey = sharedKeyPoint.getPointValue()
  clientKeys.set(clientPort, sharedKey)
  console.log('SharedKey in Server:', sharedKey)
  return publicKey
}
