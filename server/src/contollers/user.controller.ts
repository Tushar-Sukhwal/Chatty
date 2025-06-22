import { Request, Response } from "express";
import User from "../models/User.model";
import { emailSchema } from "../validation/auth.validation";
import Chat from "../models/Chat.model";

export class UserController {
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

  static async getUserByUserNameOrEmail(req: Request, res: Response) {
    const { userNameOrEmail } = req.params;
    // Use a case-insensitive regex for fuzzy search
    const nameUsers = await User.find({
      userName: { $regex: userNameOrEmail, $options: "i" },
    });
    const emailUsers = await User.find({
      email: { $regex: userNameOrEmail, $options: "i" },
    });
    const users = [...nameUsers, ...emailUsers];
    if (!users || users.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }
    //only send userid, username, avatar, email
    //remove the user from the list if it is the current user
    //also remove duplicates
    const currentUser = await User.findOne({ email: req.user?.email });
    const filteredUsers = users.filter(
      (user) => user._id.toString() !== currentUser?._id.toString()
    );
    const uniqueUsers = filteredUsers.filter(
      (user, index, self) =>
        index ===
        self.findIndex((t) => t._id.toString() === user._id.toString())
    );
    const usersData = uniqueUsers.map((user) => ({
      _id: user._id,
      userName: user.userName,
      avatar: user.avatar,
      email: user.email,
    }));
    res
      .status(200)
      .json({ message: "Users fetched successfully", data: usersData });
  }

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
    if (
      user.friends.some((id: any) => id.toString() === friend._id.toString())
    ) {
      res.status(400).json({ message: "Already friends" });
      return;
    }

    user.friends.push(friend._id);
    await user.save();

    // Also check if friend already has user as friend (for idempotency)
    if (
      !friend.friends.some((id: any) => id.toString() === user._id.toString())
    ) {
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

    //send the updated user data to the client
    res.status(200).json({
      message: "Friend added successfully",
      data: user.populate("friends"),
    });
  }
}
