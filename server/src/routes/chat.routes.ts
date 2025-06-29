import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";
import { ChatController } from "../contollers/chat.controller";

const router = Router();

/**
 * Chat Routes
 *
 * Base path: /api/chat
 *
 * GET  /        – Fetch all chats for authenticated user
 * POST /        – Create a new group chat
 */

router.get("/", verifyFirebaseToken, ChatController.getAllChats);
router.post("/", verifyFirebaseToken, ChatController.createChat);

export default router;
