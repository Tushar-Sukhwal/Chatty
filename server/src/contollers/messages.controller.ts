import { Request, Response } from "express";
import Message from "../models/Message.model";
import { emailSchema } from "../validation/auth.validation";
import User from "../models/User.model";
import Chat from "../models/Chat.model";

export class MessagesController {
  static async getAllMessages(req: Request, res: Response) {
    const userEmail = req.user?.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    //now for all the users chats get all the messages and return them in single array
    const messages = await Message.find({
      chatId: { $in: user.chats.map((chat) => chat) },
    });
    //now group the messages by chatId
    res.status(200).json({
      message: "Messages fetched successfully",
      data: messages,
    });
  }
}
