import { Router } from "express";
import { UserController } from "../contollers/user.controller";
import { verifyFirebaseToken } from "../middleware/HttpAuth.middleware";
import { upload } from "../middleware/multer.middleware";

const router = Router();

/**
 * User Routes
 *
 * Base path: /api/user
 *
 * GET  /me                                         – Fetch own profile
 * GET  /online-users                               – List online friends
 * GET  /get-user-by-username-or-email/:query       – Search users
 * POST /add-user-to-friends/:friendEmail           – Add a friend
 * PUT  /update-profile                             – Update profile details
 * GET  /check-username/:userName                   – Check username availability
 * POST /upload-avatar                              – Upload avatar image
 */


router.get(
  "/get-user-by-username-or-email/:userNameOrEmail",
  verifyFirebaseToken,
  UserController.getUserByUserNameOrEmail
);

router.post(
  "/add-user-to-friends/:friendEmail",
  verifyFirebaseToken,
  UserController.addUserToFriends
);

router.get("/me", verifyFirebaseToken, UserController.getMe);

router.get("/online-users", verifyFirebaseToken, UserController.getOnlineUsers);

router.put("/update-profile", verifyFirebaseToken, UserController.updateProfile);

router.get(
  "/check-username/:userName",
  verifyFirebaseToken,
  UserController.checkUsernameAvailability
);

router.post(
  "/upload-avatar",
  verifyFirebaseToken,
  upload.single("avatar"),
  UserController.uploadAvatar
);

export default router;
