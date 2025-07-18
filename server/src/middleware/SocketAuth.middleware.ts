import jwt from "jsonwebtoken";
import User from "../models/User.model";

/**
 * Socket Authentication Middleware
 *
 * Expects a `token` field inside `socket.handshake.auth`.
 * The token is validated as a backend-issued JWT. After validation the user's
 * MongoDB `_id` and `userName` are attached to the socket instance for later use.
 *
 * If authentication fails the connection is rejected with an `Authentication error`.
 */
export const socketAuthMiddleware = async (socket: any, next: any) => {
  try {
    //bearer token
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.emit("error", "Token not found");
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findOne({ userName: decoded.userName });

    if (!user) {
      socket.emit("error", "User not found");
      return next(new Error("Authentication error"));
    }

    socket.userName = user.userName;
    // socket.user = user;
    socket.mongoId = user._id;
    next();
  } catch (error) {
    console.log(error);
    next(new Error("Authentication error"));
  }
};
