import { Request, Response } from "express";
import Message from "../models/Message.model";
import { emailSchema } from "../validation/auth.validation";
import User from "../models/User.model";
import Chat from "../models/Chat.model";

export class MessagesController {
  static async getAllMessages(req: Request, res: Response) {
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

    //return in format like {chatId: {message object}}
    //loop on chat id and get all messages with that chat id
    const messages = await Promise.all(
      user.chats.map(async (chatId) => {
        const m = await Message.find({ chatId });
        return {
          chatId,
          messages: m,
        };
      })
    );
    res.status(200).json({
      message: "Messages fetched successfully",
      data: messages,
    });
  }
}
