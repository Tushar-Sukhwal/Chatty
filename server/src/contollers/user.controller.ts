import { Request, Response } from "express";
import User from "../models/User.model";
import { emailSchema } from "../validation/auth.validation";

export class UserController {
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
    const usersData = users.map((user) => ({
      userId: user._id,
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
    user.friends.push(friend._id);
    await user.save();
    friend.friends.push(user._id);
    await friend.save();
    res.status(200).json({ message: "Friend added successfully" });
  }
}
