import { Router } from "express";
import { UserController } from "../contollers/user.controller";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";

const router = Router();

//http://localhost:8000/api/user/get-user-by-username-or-email/userNameOrEmail
router.get(
  "/get-user-by-username-or-email/:userNameOrEmail",
  verifyFirebaseToken,
  UserController.getUserByUserNameOrEmail
);

//http://localhost:8000/api/user/add-user-to-friends/friendEmail
router.post(
  "/add-user-to-friends/:friendEmail",
  verifyFirebaseToken,
  UserController.addUserToFriends
);

//http://localhost:8000/api/user/me
router.get("/me", verifyFirebaseToken, UserController.getMe);

export default router;
