import { Request, Response } from "express";
import User from "../models/User.model";
import jwt from "jsonwebtoken";
import generateUserId from "../utils/generateUserId";
import { emailSchema } from "../validation/auth.validation";

/**
 * @description AuthController is a class that contains the methods for the auth routes
 * @class AuthController
 * @static
 * @method signup
 * @method login
 */
export class AuthController {
  /**
   * @description signup is a method that creates a new user
   * @param req - The request object
   * @param res - The response object
   * @returns void
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const emailResult = emailSchema.safeParse(req.user?.email);
      if (!req.body.name && !req.user?.name) {
        res.status(400).json({ message: "Name is required" });
        return;
      }
      const name = req.body.name || req.user?.name;

      if (!emailResult.success) {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const email = emailResult.data;
      const avatar = req.user?.picture || "";
      console.log(email);

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const userName = await generateUserId(email);
      console.log("userName", userName);
      const user = await User.create({
        email,
        name,
        userName: userName,
        avatar: avatar,
      });

      await (await user.populate("friends")).populate("chats");
      const token = jwt.sign(
        {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        process.env.JWT_SECRET!
      );
      res.status(201).json({ user, token });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  }

  /**
   * @description login is a method that logs in a user
   * @param req - The request object
   * @param res - The response object
   * @returns void
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const emailResult = emailSchema.safeParse(req.user?.email);
      if (!emailResult.success) {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const email = emailResult.data;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
      }

      await (await user.populate("friends")).populate("chats");
      const token = jwt.sign(
        {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        process.env.JWT_SECRET!
      );
      res.status(200).json({ user, token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
