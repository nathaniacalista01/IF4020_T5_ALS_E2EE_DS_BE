import express, { Request, Response } from "express";
import { authRouter } from "../controller/auth-controller";

const router = express.Router();
router.get("/", (req: Request, res: Response) => {
  res.json("hi");
});

router.use("/auth", authRouter)

export default router;
