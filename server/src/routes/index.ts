import express from "express";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import {
  createGroupChat,
  getUserGroupChats,
  getGroupDetails,
  joinGroupViaLink,
  addGroupMember,
  removeGroupMember,
  deleteGroup,
} from "../controllers/group.controller.js";
import {
  createDirectChat,
  getUserDirectChats,
  getDirectChatMessages,
} from "../controllers/directChat.controller.js";
import {
  searchUsersByEmail,
  getUserProfile,
  getOnlineGroupUsers,
} from "../controllers/user.controller.js";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

// Auth routes
router.post("/auth/login", AuthController.login);

// User routes
router.get("/users/search", AuthMiddleware, searchUsersByEmail);
router.get("/users/profile", AuthMiddleware, getUserProfile);
router.get("/users/group/:groupId/online", AuthMiddleware, getOnlineGroupUsers);

// Group chat routes
router.post("/groups", AuthMiddleware, createGroupChat);
router.get("/groups", AuthMiddleware, getUserGroupChats);
router.get("/groups/:groupId", AuthMiddleware, getGroupDetails);
router.post("/groups/:groupId/members", AuthMiddleware, addGroupMember);
router.delete(
  "/groups/:groupId/members/:memberId",
  AuthMiddleware,
  removeGroupMember
);
router.get("/groups/join/:shareLink", AuthMiddleware, joinGroupViaLink);
router.delete("/groups/:groupId", AuthMiddleware, deleteGroup);

// Direct chat routes
router.post("/direct-chats", AuthMiddleware, createDirectChat);
router.get("/direct-chats", AuthMiddleware, getUserDirectChats);
router.get(
  "/direct-chats/:chatId/messages",
  AuthMiddleware,
  getDirectChatMessages
);

export default router;
