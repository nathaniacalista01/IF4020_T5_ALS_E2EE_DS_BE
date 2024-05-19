import express, { Request, Response } from "express";
import { RoomchatService } from "../services/roomchat-service";
import { Error } from "../types/error";

export const roomchatRouter = express.Router();
const roomchatService = new RoomchatService();

roomchatRouter.get("/:user_id", async (req: Request, res: Response) => {
  console.log("Ini req", req.params);
  const { user_id } = req.params;
  console.log("INi id", user_id);
  const roomchats = await roomchatService.getRoomchatByUserId(user_id);
  res.status(200).send(roomchats);
});

roomchatRouter.get("/", async (req: Request, res: Response) => {
  res.json("Router room chat");
});

roomchatRouter.post("/", async (req: Request, res: Response) => {
  const { firstUserId, secondUserId } = req.body;
  const result = await roomchatService.createRoomchat(
    firstUserId,
    secondUserId
  );
  if (result === Error.INTERNAL_ERROR) {
    res.status(505).send("Internal server error");
  }
  res.status(200).send(result);
});
