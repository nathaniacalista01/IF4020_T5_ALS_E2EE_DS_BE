import express, { Request, Response } from "express";
import { AuthService } from "../services/auth-service";
import { Error } from "../types/error";

export const authRouter = express.Router();
const authService = new AuthService();

authRouter.post("/register", async (req: Request, res: Response) => {
  const { username, name, password } = req.body;
  const result = await authService.register(username, name, password);
  if (result === Error.INTERNAL_ERROR) {
    res.send("Something went wrong!").status(505);
  }
  res.send("Register successful").status(200);
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  switch (result) {
    case Error.USER_NOT_FOUND:
      res.send("User not found").status(404);
      break;
    case Error.WRONG_PASSWORD:
      res.send("Wrong password!").status(401);
      break;
    default:
      const {passwordHash, ...userWithoutPasswordHash} = result;
      res.send(userWithoutPasswordHash).status(200);
      break;
  }
});
