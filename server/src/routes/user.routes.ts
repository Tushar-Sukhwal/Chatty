import { Router } from "express";
import { UserController } from "../contollers/user.controller";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";
import { upload } from "../middleware/multer.middleware";

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

//http://localhost:8000/api/user/online-users
router.get("/online-users", verifyFirebaseToken, UserController.getOnlineUsers);

//http://localhost:8000/api/user/update-profile
router.put("/update-profile", verifyFirebaseToken, UserController.updateProfile);

//http://localhost:8000/api/user/check-username/:userName
router.get("/check-username/:userName", verifyFirebaseToken, UserController.checkUsernameAvailability);

//http://localhost:8000/api/user/upload-avatar
router.post("/upload-avatar", verifyFirebaseToken, upload.single("avatar"), UserController.uploadAvatar);

export default router;
