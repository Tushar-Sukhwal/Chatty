import { Request, Response } from "express";
import prisma from "../config/db.config.js";

interface GroupUserType {
  name: string;
  group_id: string;
  user_id: number;
  is_owner?: boolean;
}

class ChatGroupUserController {
  static async index(req: Request, res: Response) {
    try {
      const { group_id } = req.query;
      const users = await prisma.groupUsers.findMany({
        where: {
          group_id: group_id as string,
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

      return res.json({ message: "Data fetched successfully!", data: users });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again!" });
    }
  }

  static async store(req: Request, res: Response) {
    try {
      const body: GroupUserType = req.body;
      const user = await prisma.groupUsers.create({
        data: {
          name: body.name,
          group_id: body.group_id,
          user_id: body.user_id,
          is_owner: body.is_owner || false,
        },
      });
      return res.json({ message: "User created successfully!", data: user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again!" });
    }
  }
}

export default ChatGroupUserController;
