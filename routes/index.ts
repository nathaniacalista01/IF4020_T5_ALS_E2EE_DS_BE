import express, { Request, Response } from "express";
import { authRouter } from "../controller/auth-controller";
import { keyMiddleware } from "../middleware/middleware";
import { roomchatRouter } from "../controller/roomchat-controller";
import { testRouter } from "../controller/test-controller";

const router = express.Router();
router.post("/", keyMiddleware, (req: Request, res: Response) => {});
router.use("/auth", authRouter);
router.use("/test", testRouter);
router.use("/roomchat", roomchatRouter);

export default router;
