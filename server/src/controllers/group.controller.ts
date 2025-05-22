import { Request, Response } from "express";
import prisma from "../config/db.config.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Create a new group chat
export const createGroupChat = async (req: Request, res: Response) => {
  const { title, members } = req.body;
  const userId = req.user.id;

  try {
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Generate a unique passcode
    const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Generate a unique share link
    const shareLink = crypto.randomBytes(16).toString("hex");

    // Create the group
    const group = await prisma.chatGroup.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        title,
        passcode,
        is_group: true,
        share_link: shareLink,
      },
    });

    // Add the creator as a group member (owner)
    await prisma.groupUsers.create({
      data: {
        group_id: group.id,
        user_id: userId,
        name: req.user.name,
        is_owner: true,
      },
    });

    // Add other members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      const memberPromises = members.map(async (memberId: number) => {
        const user = await prisma.user.findUnique({
          where: { id: memberId },
          select: { name: true },
        });

        if (user) {
          return prisma.groupUsers.create({
            data: {
              group_id: group.id,
              user_id: memberId,
              name: user.name,
              is_owner: false,
            },
          });
        }
      });

      await Promise.all(memberPromises);
    }

    return res.status(201).json({
      message: "Group chat created successfully",
      group,
    });
  } catch (error) {
    console.error("Error creating group chat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all group chats for a user
export const getUserGroupChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get all groups where the user is a member
    const groupUsers = await prisma.groupUsers.findMany({
      where: {
        user_id: userId,
      },
      include: {
        group: true,
      },
    });

    // Format the response
    const groups = groupUsers.map((gu) => ({
      ...gu.group,
      is_owner: gu.is_owner,
    }));

    return res.status(200).json({ groups });
  } catch (error) {
    console.error("Error fetching user group chats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get details of a specific group
export const getGroupDetails = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if the user is a member of the group
    const groupUser = await prisma.groupUsers.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
      },
    });

    if (!groupUser) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get group details
    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        GroupUsers: {
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
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get a sharable link for the group
    const shareLink = `${process.env.CLIENT_APP_URL}/join-group/${group.share_link}`;

    return res.status(200).json({
      group,
      shareLink,
      isOwner: groupUser.is_owner,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Join a group via share link
export const joinGroupViaLink = async (req: Request, res: Response) => {
  try {
    const { shareLink } = req.params;
    const userId = req.user.id;

    // Find the group by share link
    const group = await prisma.chatGroup.findUnique({
      where: { share_link: shareLink },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is already a member
    const existingMember = await prisma.groupUsers.findFirst({
      where: {
        group_id: group.id,
        user_id: userId,
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }

    // Add user to the group
    await prisma.groupUsers.create({
      data: {
        group_id: group.id,
        user_id: userId,
        name: req.user.name,
        is_owner: false,
      },
    });

    return res.status(200).json({
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Error joining group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Add a member to a group
export const addGroupMember = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;

    // Check if the current user is the owner of the group
    const groupOwner = await prisma.groupUsers.findFirst({
      where: {
        group_id: groupId,
        user_id: currentUserId,
        is_owner: true,
      },
    });

    if (!groupOwner) {
      return res
        .status(403)
        .json({ message: "Only the group owner can add members" });
    }

    // Check if the user to be added exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a member
    const existingMember = await prisma.groupUsers.findFirst({
      where: {
        group_id: groupId,
        user_id: Number(userId),
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    // Add the user to the group
    await prisma.groupUsers.create({
      data: {
        group_id: groupId,
        user_id: Number(userId),
        name: userToAdd.name,
        is_owner: false,
      },
    });

    return res.status(200).json({
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Error adding group member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a member from a group
export const removeGroupMember = async (req: Request, res: Response) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    // Check if the current user is the owner of the group
    const groupOwner = await prisma.groupUsers.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
        is_owner: true,
      },
    });

    if (!groupOwner) {
      return res
        .status(403)
        .json({ message: "Only the group owner can remove members" });
    }

    // Cannot remove the owner
    const memberToRemove = await prisma.groupUsers.findFirst({
      where: {
        id: Number(memberId),
        group_id: groupId,
      },
    });

    if (!memberToRemove) {
      return res
        .status(404)
        .json({ message: "Member not found in this group" });
    }

    if (memberToRemove.is_owner) {
      return res.status(400).json({ message: "Cannot remove the group owner" });
    }

    // Remove the member
    await prisma.groupUsers.delete({
      where: {
        id: Number(memberId),
      },
    });

    return res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing group member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a group
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if the current user is the owner of the group
    const groupOwner = await prisma.groupUsers.findFirst({
      where: {
        group_id: groupId,
        user_id: userId,
        is_owner: true,
      },
    });

    if (!groupOwner) {
      return res
        .status(403)
        .json({ message: "Only the group owner can delete the group" });
    }

    // Delete all group users associated with the group
    await prisma.groupUsers.deleteMany({
      where: {
        group_id: groupId,
      },
    });

    // Delete the group
    await prisma.chatGroup.delete({
      where: {
        id: groupId,
      },
    });

    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
