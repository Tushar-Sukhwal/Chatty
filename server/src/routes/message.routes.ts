import { Router } from "express";
import { MessagesController } from "../contollers/messages.controller";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";

const router = Router();

router.get("/", verifyFirebaseToken, MessagesController.getAllMessages);

export default router;
