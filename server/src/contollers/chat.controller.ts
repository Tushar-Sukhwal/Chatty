import { Request, Response } from "express";
import Chat from "../models/Chat.model";
import { emailSchema } from "../validation/auth.validation";
import User from "../models/User.model";

export class ChatController {
  /**
   * @description getChats is a method that fetches the chats for a user
   * @param req - The request object
   * @param res - The response object
   * @returns void
   */
  static async getAllChats(req: Request, res: Response) {
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
    res.status(200).json({
      message: "Chats fetched successfully",
      data: user.chats,
    });
  }

  static async createChat(req: Request, res: Response) {
    const { type, name, description, avatar, participants } = req.body;
    const chat = await Chat.create({
      type,
      name,
      description,
      avatar,
      participants,
    });
    res.status(200).json({ message: "Chat created successfully", data: chat });
  }
}
