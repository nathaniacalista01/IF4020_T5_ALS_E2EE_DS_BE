import { PrismaClient } from "@prisma/client";

export class DB {
  private _prisma;
  private static instance: DB;
  private constructor() {
    this._prisma = new PrismaClient();
  }
  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  get prisma() {
    return this._prisma;
  }
}
