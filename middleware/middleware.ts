import { NextFunction, Request, Response } from 'express'
import clientKeys from '../globals/clientKeyMap'
import { decryptECB, encryptECB } from '../services/utils/crypt/ecb'
import {
  adjustText,
  makeBlocksArrayToString,
  makeStringToBlocksArray,
} from '../services/utils/crypt/process'

export const decryptionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientPort = req.connection.localPort

  if (req.method === 'GET') {
    return next()
  }

  if (!clientKeys.has(clientPort)) {
    res
      .status(401)
      .send(
        JSON.stringify({ error: 'Unauthorized, need to initialize handshake' }),
      )
    return
  }

  try {
    console.log(clientKeys)
    const key = clientKeys.get(clientPort)
    const encryptedData = req.body.encrypted
    const newkey = makeStringToBlocksArray(key, true)[0]
    const decryptedBody = decryptECB(
      makeStringToBlocksArray(encryptedData, false),
      newkey,
    )
    const decryptedStringBody = makeBlocksArrayToString(decryptedBody)
    req.body = JSON.parse(decryptedStringBody)
    next()
  } catch (error) {
    console.error('Decryption error', error)
    res.status(500).send('Failed to decrypt data')
  }
}

export const encryptionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const originalSend = res.send

  res.send = function (data) {
    const clientPort = req.connection.localPort
    // console.log(clientPort)
    if (!clientKeys.has(clientPort)) {
      return originalSend.call(
        this,
        JSON.stringify({ error: 'Unauthorized, need to initialize handshake' }),
      )
    }

    try {
      // const key = clientKeys.get(clientPort).toString('hex')
      const key = clientKeys.get(clientPort)
      const keyBlocks = makeStringToBlocksArray(key, true)[0]

      const stringData = typeof data === 'string' ? data : JSON.stringify(data)
      const textAdjusted = adjustText(stringData)
      const encryptedData = encryptECB(
        makeStringToBlocksArray(textAdjusted, false),
        keyBlocks,
      )
      const encryptedString = makeBlocksArrayToString(encryptedData)

      return originalSend.call(
        this,
        JSON.stringify({ encrypted: encryptedString }),
      )
    } catch (error) {
      console.error('Encryption error', error)
      return originalSend.call(this, data)
    }
  }

  next()
}
