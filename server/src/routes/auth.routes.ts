import { Router } from "express";
import { AuthController } from "../contollers/auth.controller";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";

const router = Router();

/**
 * Auth Routes
 *
 * Base path: /api/auth
 *
 * POST /signup  – Register a new user (requires Bearer token from Firebase)
 * POST /login   – Log an existing user in (requires Bearer token from Firebase)
 */
router.post("/signup", verifyFirebaseToken, AuthController.signup);
router.post("/login", verifyFirebaseToken, AuthController.login);

export default router;
