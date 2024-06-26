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

roomchatRouter.get("/:user_id/ids", async (req: Request, res: Response) => {
  const {user_id} = req.params;
  const roomChatIds = await roomchatService.getRoomchatIdsByUserId(user_id);
  if (roomChatIds === Error.INTERNAL_ERROR) {
    res.status(500).send("Internal server error");
  } else {
    res.status(200).send(roomChatIds);
  }
});

roomchatRouter.get("/:chatroom_id/messages", async (req: Request, res: Response) => {
  const { chatroom_id } = req.params;
  const chatroom = await roomchatService.getRoomchatById(Number(chatroom_id));
  if (chatroom === Error.INTERNAL_ERROR) {
    res.status(500).send("Internal server error");
  } else if (!chatroom) {
    res.status(404).send("Chatroom not found");
  } else {
    res.status(200).send(chatroom.messages);
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
