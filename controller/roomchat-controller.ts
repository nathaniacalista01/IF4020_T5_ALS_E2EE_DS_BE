import express, { Request, Response } from "express";
import { RoomchatService } from "../services/roomchat-service";
import { Error } from "../types/error";

export const roomchatRouter = express.Router();
const roomchatService = new RoomchatService();

roomchatRouter.get("/:user_id", async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const roomchats = await roomchatService.getRoomchatByUserId(user_id);
  if (roomchats === Error.INTERNAL_ERROR) {
    res.status(500).send("Internal server error");
  } else {
    res.status(200).send(roomchats);
  }
});

roomchatRouter.post("/", async (req: Request, res: Response) => {
  const { firstUserId, secondUserId } = req.body;
  const result = await roomchatService.createRoomchat(firstUserId, secondUserId);
  if (result === Error.INTERNAL_ERROR) {
    res.status(500).send("Internal server error");
  } else {
    res.status(200).send(result);
  }
});
