import jwt from "jsonwebtoken";
import User from "../models/User.model";

export const socketAuthMiddleware = async (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("Authentication error"));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};
