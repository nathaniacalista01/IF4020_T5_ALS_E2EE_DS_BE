import { PrismaClient } from "@prisma/client";
import { DB } from "../db/db";
import bcrypt from "bcrypt";
import { Error } from "../types/error";

export class UserService {
  private prisma: PrismaClient;
  constructor() {
    const db: DB = DB.getInstance();
    this.prisma = db.prisma;
  }
  public async addUser(username: string, name: string, password: string) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const response = await this.prisma.user.create({
        data: {
          username,
          name,
          passwordHash,
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      return Error.INTERNAL_ERROR;
    }
  }

  public async getUserByUsername(username: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
          username: true,
          name: true,
          passwordHash: true,
        },
      });
      return user;
    } catch (error) {
      console.error(error);
    }
  }
}
