import express, { Request, Response } from "express";

export const testRouter = express.Router();

testRouter.post("/", async (req: Request, res: Response) => {
  const { username, name, password } = req.body;
    console.log(req.body)
  res.send("Register successful").status(200);
});
