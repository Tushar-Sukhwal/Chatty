import { Request, Response } from "express";
import User from "../models/User.model";
import { emailSchema } from "../validation/auth.validation";
import Chat from "../models/Chat.model";
import { io } from "..";
import { RedisService } from "../services/redis.service";
import cloudinaryUtils from "../utils/cloudinary";

/**
 * @class UserController
 * @description Handles user-related operations such as profile retrieval, friend management and avatar uploads.
 *
 * @remarks All routes are prefixed with `/api/user` and protected by the `verifyFirebaseToken` middleware.
 */
export class UserController {
  /**
   * Retrieve the full profile of the authenticated user.
   *
   * @route GET /api/user/me
   * @param req Express Request – expects `req.user.email` set by auth middleware.
   * @param res Express Response – on success returns `{ message, data: User }`.
   *
   * @returns 200 with hydrated `User` document (friends, chats & participants populated)
   * @returns 404 if user not found (e.g., token invalidated while client still authenticated)
   */
  static async getMe(req: Request, res: Response) {
    const user = await User.findOne({ email: req.user?.email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await (await user.populate("friends")).populate("chats");
    await user.populate("chats.participants.user");

    res.status(200).json({ message: "User fetched successfully", data: user });
  }

  /**
   * Perform a fuzzy search across userName, email and display name.
   *
   * @route GET /api/user/get-user-by-username-or-email/:userNameOrEmail
   * @param req `userNameOrEmail` path param
   * @param res Returns an array of lightweight user DTOs excluding the requester.
   *
   * Filtering logic:
   *  • Combines matches from three separate regex queries (userName, email, name).
   *  • Removes the current user and duplicate documents before responding.
   */
  static async getUserByUserNameOrEmail(req: Request, res: Response) {
    const { userNameOrEmail } = req.params;
    // Use a case-insensitive regex for fuzzy search
    const userNameUsers = await User.find({
      userName: { $regex: userNameOrEmail, $options: "i" },
    });
    const emailUsers = await User.find({
      email: { $regex: userNameOrEmail, $options: "i" },
    });
    const nameUsers = await User.find({
      name: { $regex: userNameOrEmail, $options: "i" },
    });
    const users = [...userNameUsers, ...emailUsers, ...nameUsers];
    if (!users || users.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }
    //only send userid, username, avatar, email
    //remove the user from the list if it is the current user
    //also remove duplicates
    const currentUser = await User.findOne({ email: req.user?.email });
    const filteredUsers = users.filter(user => user._id.toString() !== currentUser?._id.toString());
    const uniqueUsers = filteredUsers.filter(
      (user, index, self) => index === self.findIndex(t => t._id.toString() === user._id.toString())
    );
    const usersData = uniqueUsers.map(user => ({
      _id: user._id,
      name: user.name,
      userName: user.userName,
      avatar: user.avatar,
      email: user.email,
    }));
    res.status(200).json({ message: "Users fetched successfully", data: usersData });
  }

  /**
   * Add another user as a friend **and** automatically create a direct chat.
   *
   * @route POST /api/user/add-user-to-friends/:friendEmail
   * @param req `friendEmail` path param + authenticated user.
   * @param res On success returns the updated user doc (with populated friends).
   *
   * Processing steps:
   * 1. Validate requester email & friend email.
   * 2. Ensure they are not already friends.
   * 3. Update both users' `friends` arrays.
   * 4. Create a direct `Chat` document and push its ID to both users.
   * 5. Emit `triggerChatUpdate` via Socket.IO for live UI refresh.
   */
  static async addUserToFriends(req: Request, res: Response) {
    const { friendEmail } = req.params;
    const emailResult = emailSchema.safeParse(req.user?.email);

    if (!emailResult.success) {
      res.status(400).json({ message: "Invalid email address" });
      return;
    }

    const email = emailResult.data;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const friend = await User.findOne({ email: friendEmail });
    if (!friend) {
      res.status(404).json({ message: "Friend not found" });
      return;
    }

    // Check if already friends
    if (user.friends.some((id: any) => id.toString() === friend._id.toString())) {
      res.status(400).json({ message: "Already friends" });
      return;
    }

    user.friends.push(friend._id);
    await user.save();

    // Also check if friend already has user as friend (for idempotency)
    if (!friend.friends.some((id: any) => id.toString() === user._id.toString())) {
      friend.friends.push(user._id);
      await friend.save();
    }

    //create a chat with the user and the friend
    const chat = await Chat.create({
      participants: [
        {
          user: user._id,
          lastSeen: new Date(Date.now()),
        },
        {
          user: friend._id,
          lastSeen: new Date(Date.now()),
        },
      ],
      type: "direct",
      createdBy: user._id,
    });

    //add the chat to the user and the friend
    user.chats.push(chat._id);
    await user.save();
    friend.chats.push(chat._id);
    await friend.save();

    io.emit("triggerChatUpdate", {
      chatId: chat._id,
      chatName: chat.name,
      chatType: chat.type,
      chatParticipants: chat.participants,
    });

    //send the updated user data to the client
    res.status(200).json({
      message: "Friend added successfully",
      data: user.populate("friends"),
    });
  }

  /**
   * Return a list of **online friend IDs** for the authenticated user.
   *
   * @route GET /api/user/online-users
   * @remarks
   * Online status is tracked in Redis (`online:<mongoId>`), populated by Socket.IO connection events.
   */
  static async getOnlineUsers(req: Request, res: Response) {
    const email = req.user?.email;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const friends = user.friends;
    const onlineUsers: string[] = [];
    friends.forEach(async friend => {
      const isOnline = await RedisService.getOnlineStatus(friend);
      if (isOnline) {
        onlineUsers.push(friend.toString());
      }
    });
    const globalOnlineUsers = await RedisService.getOnlineUsers();
    console.log("globalOnlineUsers", globalOnlineUsers);
    console.log("onlineUsers", onlineUsers);
    res.status(200).json({
      message: "Online users fetched successfully",
      data: onlineUsers,
    });
  }

  /**
   * Update the user's profile (name, username, avatar URL).
   *
   * @route PUT /api/user/update-profile
   * @body { name: string; userName: string; avatar?: string }
   *
   * Server-side checks:
   * • `name` & `userName` are required.
   * • `userName` must be unique across the collection (unless unchanged).
   *
   * On success returns the updated and re-populated user document.
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const emailResult = emailSchema.safeParse(req.user?.email);
      if (!emailResult.success) {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const email = emailResult.data;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const { name, userName, avatar } = req.body;

      // Validate input
      if (!name || !userName) {
        res.status(400).json({ message: "Name and username are required" });
        return;
      }

      // Check if username is being changed and if it's already taken by another user
      if (userName !== user.userName) {
        const existingUser = await User.findOne({
          userName,
          _id: { $ne: user._id },
        });
        if (existingUser) {
          res.status(400).json({ message: "Username is already taken" });
          return;
        }
      }

      // Update user fields
      user.name = name;
      user.userName = userName;
      if (avatar) {
        user.avatar = avatar;
      }

      await user.save();
      await (await user.populate("friends")).populate("chats");
      await user.populate("chats.participants.user");

      res.status(200).json({
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Check if a username is available (case-sensitive).
   *
   * @route GET /api/user/check-username/:userName
   */
  static async checkUsernameAvailability(req: Request, res: Response) {
    try {
      const { userName } = req.params;
      const emailResult = emailSchema.safeParse(req.user?.email);

      if (!emailResult.success) {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const email = emailResult.data;
      const currentUser = await User.findOne({ email });
      if (!currentUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Check if username is the same as current user's username
      if (userName === currentUser.userName) {
        res.status(200).json({
          available: true,
          message: "This is your current username",
        });
        return;
      }

      // Check if username exists for another user
      const existingUser = await User.findOne({
        userName,
        _id: { $ne: currentUser._id },
      });

      res.status(200).json({
        available: !existingUser,
        message: existingUser ? "Username is already taken" : "Username is available",
      });
    } catch (error) {
      console.error("Username availability check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Upload a new avatar image and update the user's `avatar` field.
   *
   * @route POST /api/user/upload-avatar
   * @formData avatar – multipart/form-data file field; validated by multer middleware
   *
   * Workflow:
   * 1. Uploads the file to Cloudinary (`chatty-avatars` folder).
   * 2. Deletes the previous Cloudinary asset if one existed.
   * 3. Saves the new URL on the user document and responds with the CDN URL.
   */
  static async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const emailResult = emailSchema.safeParse(req.user?.email);
      if (!emailResult.success) {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const email = emailResult.data;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Upload file to Cloudinary in avatars folder
      const cloudinaryResponse = await cloudinaryUtils.uploadOnCloudinary(
        req.file.path,
        "chatty-avatars"
      );

      if (!cloudinaryResponse) {
        res.status(500).json({ error: "Failed to upload avatar to cloud storage" });
        return;
      }

      // Delete old avatar from cloudinary if it exists
      if (user.avatar && user.avatar.includes("cloudinary")) {
        const publicId = user.avatar.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinaryUtils.deleteFromCloudinary(`chatty-avatars/${publicId}`);
        }
      }

      // Update user avatar
      user.avatar = cloudinaryResponse.secure_url;
      await user.save();

      res.status(200).json({
        message: "Avatar uploaded successfully",
        data: {
          avatar: cloudinaryResponse.secure_url,
        },
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ error: "Internal server error during avatar upload" });
    }
  }
}
