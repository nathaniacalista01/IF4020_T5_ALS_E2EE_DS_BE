import { PrismaClient } from "@prisma/client";
import { DB } from "../db/db";
import { Error } from "../types/error";

export class MessageService {
  private prisma: PrismaClient;
  constructor() {
    const db: DB = DB.getInstance();
    this.prisma = db.prisma;
  }

  public async addMessage(message: string) {
    console.log("Ini message : ", message);
    const dummySender = await this.prisma.user.findUnique({
      where: {
        username: "username 0",
      },
      select: {
        id: true,
      },
    });
    const dummyReceiver = await this.prisma.user.findUnique({
      where: {
        username: "username 2",
      },
      select: {
        id: true,
      },
    });
    const sender = dummySender?.id;
    const receiver = dummyReceiver?.id;
    if (sender && receiver) {
      try {
        const response = await this.prisma.message.create({
          data:{
            senderId : sender,
            receiverId : receiver,
            hashedMessage : message
          }
        })
        return response;
      } catch (error) {
        console.error(error);
        return Error.INTERNAL_ERROR;
      }
    }
  }
}
