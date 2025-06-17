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

      if (!emailResult.success) {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const email = emailResult.data;
      const avatar = req.user?.picture || "";

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const userName = await generateUserId(email);

      const user = await User.create({ email, userName, avatar });

      const token = jwt.sign(
        { userId: user._id, userName: user.userName },
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

      const token = jwt.sign(
        { userId: user._id, userName: user.userName },
        process.env.JWT_SECRET!
      );
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
