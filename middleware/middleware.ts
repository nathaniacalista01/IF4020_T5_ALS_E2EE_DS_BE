import { NextFunction, Request, Response } from "express";
import clientKeys from "../global";
import { generateSharedKey } from "../utils/key-generator";
import { decryptECB } from "../services/utils/crypt/ecb";
import { makeBlocksArrayToString, makeStringToBlocksArray } from "../services/utils/crypt/process";

export const keyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(clientKeys);
  const clientPort = req.connection.localPort;
  const clientPublicKey = req.body.key;
  if (!clientPort) {
    res.status(505).send("Client port not found!");
    return;
  }
  if (clientKeys.has(clientPort)) {
    console.log("Key already exist!");
    res.status(201).send("Key already exists");
    return;
  } else {
    const serverPublicKey = generateSharedKey(clientPort, clientPublicKey);
    res.status(200).send(serverPublicKey);
    return;
  }
};


export const decryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const clientPort = req.connection.localPort;

  // Uncomment this
  // if (!clientKeys.has(clientPort)) {
  //   // Handshake ulang di sini
  //   res.status(401).send("Authentication failed: no key found for client.");
  //   return;
  // }

  try {
    const key = clientKeys.get(clientPort);
    const encryptedData = Buffer.from(req.body.encrypted, 'base64').toString('utf8');
    const decryptedBody = decryptECB(makeStringToBlocksArray(encryptedData, false), "");
    const decryptedStringBody = makeBlocksArrayToString(decryptedBody);
    req.body = JSON.parse(decryptedStringBody);
    next();

  } catch (error) {
    console.error('Decryption error', error);
    res.status(500).send("Failed to decrypt data");
  }

}
