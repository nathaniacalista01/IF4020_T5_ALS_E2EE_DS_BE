import { PrismaClient } from "@prisma/client";
import { DB } from "../db/db";
import { Error } from "../types/error";

interface Roomchat {
  id: number;
  firstUserId: string;
  secondUserId: string;
  createdAt: Date;
}

export class RoomchatService {
  private prisma: PrismaClient;

  constructor() {
    const db: DB = DB.getInstance();
    this.prisma = db.prisma;
  }

  public async createRoomchat(firstUserId: string, secondUserId: string): Promise<Roomchat | Error.INTERNAL_ERROR> {
    try {
      const roomchat = await this.prisma.roomChat.create({
        data: {
          firstUserId,
          secondUserId,
        },
      });
      return roomchat;
    } catch (error) {
      console.error('Error creating room chat:', error);
      return Error.INTERNAL_ERROR;
    }
  }

  public async getRoomchatByUserId(userId: string) {
    try {
      const roomchats = await this.prisma.roomChat.findMany({
        where: {
          OR: [{ firstUserId: userId }, { secondUserId: userId }],
        },
        include: { messages: true },
      });
      return roomchats;
    } catch (error) {
      console.error('Error fetching room chats:', error);
      return Error.INTERNAL_ERROR;
    }
  }

  public async getRoomchatById(roomId: number) {
    try {
      const roomchat = await this.prisma.roomChat.findUnique({
        where: { id: roomId },
        include: { messages: true },
      });
      return roomchat;
    } catch (error) {
      console.error('Error fetching room chat by ID:', error);
      return Error.INTERNAL_ERROR;
    }
  }

  public async getRoomchatIdsByUserId(userId: string): Promise<number[] | Error.INTERNAL_ERROR> {
    try {
      const roomchats = await this.prisma.roomChat.findMany({
        where: {
          OR: [{ firstUserId: userId }, { secondUserId: userId }],
        },
        select: { id: true },
      });
      return roomchats.map(room => room.id);
    } catch (error) {
      console.error('Error fetching room chat IDs by user ID:', error);
      return Error.INTERNAL_ERROR;
    }
  }

  public async deleteRoomchat(roomId: number): Promise<boolean | Error.INTERNAL_ERROR> {
    try {
      await this.prisma.roomChat.delete({
        where: { id: roomId },
      });
      return true;
    } catch (error) {
      console.error('Error deleting room chat:', error);
      return Error.INTERNAL_ERROR;
    }
  }
}
