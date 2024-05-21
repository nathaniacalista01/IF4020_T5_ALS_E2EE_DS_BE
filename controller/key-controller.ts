import express, { Request, Response } from 'express';
import { generateSharedKey } from '../utils/key-generator';
import clientKeys from '../global';
export const keyRouter = express.Router();

keyRouter.post("/", async (req: Request, res: Response) => {
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
})