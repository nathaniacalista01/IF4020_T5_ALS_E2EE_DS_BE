import { NextFunction, Request, Response } from "express";
import clientKeys from "../global";
import { generateSharedKey } from "../utils/key-generator";

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
