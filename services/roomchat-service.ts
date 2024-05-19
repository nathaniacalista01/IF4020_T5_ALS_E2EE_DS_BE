import { PrismaClient } from "@prisma/client";
import { DB } from "../db/db";
import { Error } from "../types/error";

export class RoomchatService {
  private prisma: PrismaClient;
  constructor() {
    const db: DB = DB.getInstance();
    this.prisma = db.prisma;
  }

  public async createRoomchat(firstUserId: string, secondUserId: string) {
    try {
      const roomchat = await this.prisma.roomChat.create({
        data: {
          firstUserId,
          secondUserId,
        },
      });
      return roomchat;
    } catch (error) {
      return Error.INTERNAL_ERROR;
    }
  }
  public async getRoomchatByUserId(id: string) {
    const roomchats = await this.prisma.roomChat.findMany({
      where: {
        OR: [
          {
            firstUserId: id,
          },
          {
            secondUserId: id,
          },
        ],
      },
    });
    return roomchats;
  }
}
