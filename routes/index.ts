import express, { Request, Response } from "express";
import { authRouter } from "../controller/auth-controller";
import { decryptionMiddleware, encryptionMiddleware } from "../middleware/middleware";
import { roomchatRouter } from "../controller/roomchat-controller";
import { testRouter } from "../controller/test-controller";
import { keyRouter } from "../controller/key-controller";

const router = express.Router();
router.use("/key", keyRouter);

router.use(decryptionMiddleware);
router.use(encryptionMiddleware);
router.use("/auth", authRouter);
router.use("/test", testRouter);
router.use("/roomchat", roomchatRouter);

export default router;
