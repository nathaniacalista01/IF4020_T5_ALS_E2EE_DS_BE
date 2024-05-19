import { PrismaClient } from "@prisma/client";
import { DB } from "../db/db";
import { Error as CustomError } from "../types/error";
import { validate as isUUID } from 'uuid';

export class MessageService {
  private prisma: PrismaClient;

  constructor() {
    const db: DB = DB.getInstance();
    this.prisma = db.prisma;
  }

  public async addMessage(senderId: string, receiverId: string, roomChatId: number, message: string) {
    if (!isUUID(senderId)) {
      console.error(`Invalid UUID for senderId: ${senderId}`);
      throw new Error(`Invalid UUID for senderId: ${senderId}`);
    }

    if (!isUUID(receiverId)) {
      console.error(`Invalid UUID for receiverId: ${receiverId}`);
      throw new Error(`Invalid UUID for receiverId: ${receiverId}`);
    }

    try {
      const sender = await this.prisma.user.findUnique({
        where: { id: senderId },
        select: { id: true },
      });

      if (!sender) {
        throw new Error(`Sender with id ${senderId} not found`);
      }

      const receiver = await this.prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true },
      });

      if (!receiver) {
        throw new Error(`Receiver with id ${receiverId} not found`);
      }

      const response = await this.prisma.message.create({
        data: {
          senderId,
          receiverId,
          roomChatId,
          hashedMessage: message,
        },
      });
      return response;
    } catch (error) {
      console.error("Error adding message:", error);
      return CustomError.INTERNAL_ERROR;
    }
  }
}
