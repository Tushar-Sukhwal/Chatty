import { Router } from "express";
import { MessagesController } from "../contollers/messages.controller";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";
import { uploadSingle, handleMulterError } from "../middleware/multer.middleware";

const router = Router();

/**
 * Message Routes
 *
 * Base path: /api/message
 *
 * GET  /         – Retrieve all messages for current user
 * POST /upload   – Upload a file (handled by multer)
 */

router.get("/", verifyFirebaseToken, MessagesController.getAllMessages);
router.post(
  "/upload",
  verifyFirebaseToken,
  uploadSingle,
  handleMulterError,
  MessagesController.uploadFile
);

export default router;
