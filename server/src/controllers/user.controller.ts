import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { RedisService } from "../services/redis.service.js";

// Search users by email
export const searchUsersByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const userId = req.user.id;

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    // Find users that match the email query (case insensitive)
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: "insensitive",
        },
        // Exclude the current user
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    // Get online status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const isOnline = await RedisService.isUserOnline(user.id.toString());
        return {
          ...user,
          isOnline,
        };
      })
    );

    return res.status(200).json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get online users in a group
export const getOnlineGroupUsers = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if the group exists and user is a member
    const groupMember = await prisma.groupUsers.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!groupMember) {
      return res
        .status(403)
        .json({ message: "Access denied or group not found" });
    }

    // Get all users in the group
    const groupUsers = await prisma.groupUsers.findMany({
      where: {
        group_id: groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Check online status for each user
    const usersWithStatus = await Promise.all(
      groupUsers.map(async (groupUser) => {
        const isOnline = await RedisService.isUserOnline(
          groupUser.user_id.toString()
        );
        return {
          id: groupUser.id,
          user: {
            ...groupUser.user,
            isOnline,
          },
          is_owner: groupUser.is_owner,
          created_at: groupUser.created_at,
        };
      })
    );

    return res.status(200).json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error fetching online group users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
