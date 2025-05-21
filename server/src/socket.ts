import { Server, Socket } from "socket.io";
import { produceMessage } from "./helper.js";
import { RedisService } from "./services/redis.service.js";

interface CustomSocket extends Socket {
  room?: string;
  userId?: string;
}

export function setupSocket(io: Server) {
  io.use((socket: CustomSocket, next) => {
    const room = socket.handshake.auth.room || socket.handshake.headers.room;
    const userId =
      socket.handshake.auth.userId || socket.handshake.headers.userId;

    if (!room) {
      return next(new Error("Invalid room"));
    }

    socket.room = room;
    socket.userId = userId;
    next();
  });

  io.on("connection", async (socket: CustomSocket) => {
    console.log("User connected:", socket.id);

    // Join the room
    socket.join(socket.room);

    // Set user as online if userId is provided
    if (socket.userId) {
      await RedisService.addOnlineUser(socket.id, socket.userId);
      // Broadcast user online status to all clients in the room
      io.to(socket.room).emit("user_status", {
        userId: socket.userId,
        status: "online",
      });
    }

    // Handle chat messages
    socket.on("message", async (data) => {
      try {
        // Send message to Kafka
        await produceMessage("chats", data);
      } catch (error) {
        console.log("The kafka produce error is", error);
      }
      // Broadcast message to room
      socket.to(socket.room).emit("message", data);

      // Remove typing status when user sends message
      if (socket.userId) {
        await RedisService.removeUserTyping(socket.room, socket.userId);
        io.to(socket.room).emit("typing_status", {
          users: await RedisService.getTypingUsers(socket.room),
          roomId: socket.room,
        });
      }
    });

    // Handle typing status
    socket.on("typing", async () => {
      if (!socket.userId) return;

      await RedisService.setUserTyping(socket.room, socket.userId);

      // Broadcast typing status to all users in the room
      io.to(socket.room).emit("typing_status", {
        users: await RedisService.getTypingUsers(socket.room),
        roomId: socket.room,
      });
    });

    // Handle stop typing
    socket.on("stop_typing", async () => {
      if (!socket.userId) return;

      await RedisService.removeUserTyping(socket.room, socket.userId);

      // Broadcast typing status to all users in the room
      io.to(socket.room).emit("typing_status", {
        users: await RedisService.getTypingUsers(socket.room),
        roomId: socket.room,
      });
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      // If userId was provided, update online status
      if (socket.userId) {
        await RedisService.removeOnlineUser(socket.id);

        // Check if user has no other active connections before broadcasting offline status
        const isStillOnline = await RedisService.isUserOnline(socket.userId);
        if (!isStillOnline) {
          io.to(socket.room).emit("user_status", {
            userId: socket.userId,
            status: "offline",
          });
        }

        // Remove typing status on disconnect
        await RedisService.removeUserTyping(socket.room, socket.userId);
        io.to(socket.room).emit("typing_status", {
          users: await RedisService.getTypingUsers(socket.room),
          roomId: socket.room,
        });
      }
    });
  });
}
