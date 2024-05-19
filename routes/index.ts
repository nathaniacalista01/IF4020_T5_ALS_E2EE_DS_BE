import express, { Request, Response } from "express";
import { authRouter } from "../controller/auth-controller";
import { keyMiddleware } from "../middleware/middleware";

const router = express.Router();
router.post("/", keyMiddleware, (req: Request, res: Response) => {});
router.use("/auth", authRouter);

export default router;
