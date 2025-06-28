import { Request, Response } from "express";
import Message from "../models/Message.model";
import { emailSchema } from "../validation/auth.validation";
import User from "../models/User.model";
import Chat from "../models/Chat.model";
import cloudinaryUtils from "../utils/cloudinary";

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

  static async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const userEmail = req.user?.email;
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Upload file to Cloudinary
      const cloudinaryResponse = await cloudinaryUtils.uploadOnCloudinary(
        req.file.path
      );

      if (!cloudinaryResponse) {
        res
          .status(500)
          .json({ error: "Failed to upload file to cloud storage" });
        return;
      }

      // Determine message type based on file
      const messageType = cloudinaryUtils.getFileType(
        cloudinaryResponse.resource_type,
        cloudinaryResponse.format
      );

      const fileData = {
        url: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        originalName: req.file.originalname, // Always use the original filename from the request
        size: cloudinaryResponse.bytes,
        mimeType: req.file.mimetype,
        width: cloudinaryResponse.width,
        height: cloudinaryResponse.height,
        duration: cloudinaryResponse.duration,
      };

      res.status(200).json({
        message: "File uploaded successfully",
        data: {
          file: fileData,
          type: messageType,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      res
        .status(500)
        .json({ error: "Internal server error during file upload" });
    }
  }
}
