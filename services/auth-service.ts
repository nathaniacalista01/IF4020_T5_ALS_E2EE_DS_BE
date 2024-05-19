import { UserService } from "./user-service";
import { DB } from "../db/db";
import bcrypt from "bcrypt";
import { Error } from "../types/error";

export class AuthService {
  private user: UserService;

  constructor() {
    const db: DB = DB.getInstance();
    this.user = new UserService();
  }

  public async register(username: string, name: string, password: string) {
    const result = await this.user.addUser(username, name, password);
    return result;
  }

  public async login(username: string, password: string) {
    const user = await this.user.getUserByUsername(username);
    if (user) {
      const passwordHash = user.passwordHash;
      const isValid = await bcrypt.compare(password, passwordHash);
      if (!isValid) {
        console.log("Password is wrong");
        return Error.WRONG_PASSWORD;
      }
      return user;
    }
    console.log("User not found");
    return Error.USER_NOT_FOUND;
  }
}
