import { Router } from "express";
import { AuthController } from "@/contollers/auth.controller";
import { verifyFirebaseToken } from "@/middleware/HttpAuth.middleware";

const router = Router();

router.post("/signup", verifyFirebaseToken, AuthController.signup);
router.post("/login", verifyFirebaseToken, AuthController.login);

export default router;
