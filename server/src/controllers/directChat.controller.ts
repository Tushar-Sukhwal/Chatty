import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../services/redis.service.js";

// Create or get a direct chat between users
export const createDirectChat = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    // Check if users exist
    const receiver = await prisma.user.findUnique({
      where: { id: Number(receiverId) },
    });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Check if a direct chat already exists between users
    let directChat = await prisma.directChat.findFirst({
      where: {
        OR: [
          {
            sender_id: senderId,
            receiver_id: Number(receiverId),
          },
          {
            sender_id: Number(receiverId),
            receiver_id: senderId,
          },
        ],
      },
    });

    // If no direct chat exists, create a new one
    if (!directChat) {
      directChat = await prisma.directChat.create({
        data: {
          id: uuidv4(),
          sender_id: senderId,
          receiver_id: Number(receiverId),
        },
      });
    }

    return res.status(200).json({
      message: "Direct chat created/found successfully",
      chat: directChat,
    });
  } catch (error) {
    console.error("Error creating direct chat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all direct chats for a user
export const getUserDirectChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get all direct chats where user is either sender or receiver
    const directChats = await prisma.directChat.findMany({
      where: {
        OR: [{ sender_id: userId }, { receiver_id: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Format the response to show the other user in each chat
    const formattedChats = await Promise.all(
      directChats.map(async (chat) => {
        const otherUser =
          chat.sender_id === userId ? chat.receiver : chat.sender;
        const isOnline = await RedisService.isUserOnline(
          otherUser.id.toString()
        );
        return {
          id: chat.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            image: otherUser.image,
            isOnline,
          },
          created_at: chat.created_at,
        };
      })
    );

    return res.status(200).json({
      directChats: formattedChats,
    });
  } catch (error) {
    console.error("Error fetching user direct chats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get messages for a specific direct chat
export const getDirectChatMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify the user has access to this chat
    const chat = await prisma.directChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.sender_id !== userId && chat.receiver_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get messages
    const messages = await prisma.chats.findMany({
      where: { direct_chat_id: chatId },
      orderBy: { created_at: "asc" },
    });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching direct chat messages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
