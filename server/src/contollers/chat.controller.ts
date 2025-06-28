import { Request, Response } from "express";
import Chat from "../models/Chat.model";
import { emailSchema } from "../validation/auth.validation";
import User from "../models/User.model";
import { io } from "..";

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
    const emails = req.body.emails;
    const chatName = req.body.chatName;
    const user = await User.findOne({ email: req.user?.email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    //check if the emails are valid
    const validEmails = emails.every(
      (email: string) => emailSchema.safeParse(email).success
    );
    if (!validEmails) {
      res.status(400).json({ message: "Invalid email addresses" });
      return;
    }

    //check if the emails are unique
    const uniqueEmails = emails.filter(
      (email: string, index: number, self: string[]) =>
        self.indexOf(email) === index
    );
    if (uniqueEmails.length !== emails.length) {
      res.status(400).json({ message: "Duplicate email addresses" });
      return;
    }
    if (!chatName || chatName === "") {
      res.status(400).json({
        message: "please provide chatName",
      });
    }
    //check if the emails are friends
    const friends = await User.find({ email: { $in: emails } });
    if (friends.length !== emails.length) {
      res.status(400).json({ message: "Some emails are not friends" });
      return;
    }

    if (emails.length === 1) {
      res.status(400).json({ message: "chat already exists" });
    }

    const participants = friends.map((friend) => ({ user: friend._id }));
    participants.push({ user: user._id });

    //create the chat
    const chat = await Chat.create({
      name: chatName,
      type: "group",
      participants,
      createdBy: user._id,
    });

    user.chats.push(chat._id);
    await user.save();

    for (const friend of friends) {
      friend.chats.push(chat._id);
      await friend.save();
    }

    res.status(200).json({
      message: "Group chat created successfully",
      data: chat,
    });

    io.to(chat._id.toString()).emit("triggerChatUpdate", {});

    return;
  }
}
