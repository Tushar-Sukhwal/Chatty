import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";
import { ChatController } from "../contollers/chat.controller";

const router = Router();

router.get("/", verifyFirebaseToken, ChatController.getAllChats);
router.post("/", verifyFirebaseToken, ChatController.createChat);

export default router;
