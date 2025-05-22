import { Server, Socket } from "socket.io";
import { produceMessage } from "./helper.js";
import {
  RedisService,
  ONLINE_USERS_KEY,
  USER_SOCKETS_KEY,
  DEFAULT_SOCKET_TTL,
} from "./services/redis.service.js";
import redis from "./config/redis.js";

interface CustomSocket extends Socket {
  room?: string;
  userId?: string;
}

export function setupSocket(io: Server) {
  // Helper function to cleanup Redis when a socket disconnects
  const cleanupSocketData = async (socket: CustomSocket) => {
    try {
      if (socket.userId) {
        // First remove the user from online users
        await RedisService.removeOnlineUser(socket.id);
        console.log(
          `[cleanupSocketData] Removed socket ${socket.id} for user ${socket.userId}`
        );

        // Then remove from typing users if they were typing
        await RedisService.removeUserTyping(socket.room, socket.userId);
        console.log(
          `[cleanupSocketData] Removed typing status for user ${socket.userId} in room ${socket.room}`
        );

        // Check if user is still online on other connections
        const isStillOnline = await RedisService.isUserOnline(socket.userId);

        // If this is the last connection, remove from all rooms
        if (!isStillOnline && socket.room) {
          // Keep track of rooms before we remove from all
          const rooms = await RedisService.getUserRooms(socket.userId);
          console.log(
            `[cleanupSocketData] User ${
              socket.userId
            } was in rooms: ${JSON.stringify(rooms)}`
          );
        }

        return { isStillOnline, userId: socket.userId, room: socket.room };
      } else {
        // Just cleanup the socket entry
        await RedisService.removeOnlineUser(socket.id);
        console.log(
          `[cleanupSocketData] Cleaned up socket ID: ${socket.id} without userId`
        );
        return null;
      }
    } catch (error) {
      console.error(
        `[cleanupSocketData] Error during cleanup: ${error.message}`
      );
      // Attempt forced cleanup of the socket in case of error
      try {
        await RedisService.forceCleanupSocket(socket.id);
      } catch {}
      return null;
    }
  };

  // Set up periodic cleanup for stale Redis entries (every 2 minutes)
  const CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutes instead of 5
  setInterval(async () => {
    try {
      console.log("[Periodic Cleanup] Starting cleanup of stale entries");

      // Perform a full cleanup of stale entries
      await RedisService.cleanupStaleEntries();

      // Additional check for orphaned socket entries
      const allSockets = Array.from(io.sockets.sockets.keys());
      const storedSockets = await redis.hkeys(ONLINE_USERS_KEY);

      // Find sockets in Redis that are no longer active in Socket.IO
      const staleSocketIds = storedSockets.filter(
        (id) => !allSockets.includes(id)
      );
      console.log(
        `[Periodic Cleanup] Found ${staleSocketIds.length} stale socket entries to clean up`
      );

      // Clean up each stale socket
      for (const socketId of staleSocketIds) {
        await RedisService.forceCleanupSocket(socketId);
      }

      console.log("[Periodic Cleanup] Completed cleanup of stale entries");
    } catch (error) {
      console.error(`[Periodic Cleanup] Error: ${error.message}`);
    }
  }, CLEANUP_INTERVAL);

  // Also set up a more frequent quick cleanup for any stale socket entries
  const QUICK_CLEANUP_INTERVAL = 30 * 1000; // 30 seconds
  setInterval(async () => {
    try {
      // Just expire the keys to ensure TTL is working
      await redis.expire(ONLINE_USERS_KEY, DEFAULT_SOCKET_TTL);
      await redis.expire(USER_SOCKETS_KEY, DEFAULT_SOCKET_TTL);

      // Quick check for online_users consistency
      const onlineUsers = await redis.hgetall(ONLINE_USERS_KEY);
      const userCount = Object.keys(onlineUsers).length;
      console.log(`[Quick Cleanup] Current socket count: ${userCount}`);

      // If there are a lot of entries, trigger a full cleanup
      if (userCount > 100) {
        console.log(
          `[Quick Cleanup] High socket count detected (${userCount}), triggering full cleanup`
        );
        await RedisService.cleanupStaleEntries();
      }
    } catch (error) {
      console.error(`[Quick Cleanup] Error: ${error.message}`);
    }
  }, QUICK_CLEANUP_INTERVAL);

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
    console.log(
      "User connected - Socket ID:",
      socket.id,
      "User ID:",
      socket.userId,
      "Room:",
      socket.room
    );

    // Join the room
    socket.join(socket.room);

    // Set user as online if userId is provided
    if (socket.userId) {
      // Clean up any old sockets for this user that might be stale
      const userSocketsRaw = await redis.hget(USER_SOCKETS_KEY, socket.userId);
      if (userSocketsRaw) {
        try {
          const sockets = JSON.parse(userSocketsRaw);
          // Check if any of these sockets are no longer in the io.sockets list
          const currentSockets = Array.from(io.sockets.sockets.keys());
          const staleSockets = sockets.filter(
            (id) => !currentSockets.includes(id)
          );

          // Clean up any stale sockets
          for (const staleSocketId of staleSockets) {
            await RedisService.forceCleanupSocket(staleSocketId);
            console.log(
              `[Connection] Cleaned up stale socket ${staleSocketId} for user ${socket.userId}`
            );
          }
        } catch (error) {
          console.error(
            `[Connection] Error cleaning up old sockets: ${error.message}`
          );
        }
      }

      // Now add the new socket
      await RedisService.addOnlineUser(socket.id, socket.userId);

      // Track that this user is in this room
      await RedisService.addUserToRoom(socket.userId, socket.room);

      // Broadcast user online status to all clients in the room
      io.to(socket.room).emit("user_status", {
        userId: socket.userId,
        status: "online",
      });

      // Also broadcast to all rooms this user is in
      const rooms = await RedisService.getUserRooms(socket.userId);
      for (const roomId of rooms) {
        if (roomId !== socket.room) {
          io.to(roomId).emit("user_status", {
            userId: socket.userId,
            status: "online",
          });
        }
      }
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
      console.log(
        "User disconnected - Socket ID:",
        socket.id,
        "User ID:",
        socket.userId,
        "Room:",
        socket.room
      );

      try {
        // First try the force cleanup to ensure socket is definitely removed
        await RedisService.forceCleanupSocket(socket.id);

        // Then do the regular cleanup process
        const result = await cleanupSocketData(socket);

        if (result && !result.isStillOnline) {
          console.log(
            `[Socket Disconnect] User ID: ${result.userId} - Emitting 'offline' status to room ${result.room}`
          );

          // Remove user from this room in tracking
          if (socket.room && socket.userId) {
            await RedisService.removeUserFromRoom(socket.userId, socket.room);
          }

          // Broadcast offline status to all rooms this user was in
          const rooms = await RedisService.getUserRooms(result.userId);
          for (const roomId of rooms) {
            io.to(roomId).emit("user_status", {
              userId: result.userId,
              status: "offline",
            });
          }

          // Also send to the current room
          io.to(result.room).emit("user_status", {
            userId: result.userId,
            status: "offline",
          });
        } else if (result) {
          console.log(
            `[Socket Disconnect] User ID: ${result.userId} - Still has other connections. Not emitting 'offline'.`
          );
        }

        // Always update typing status for the room
        if (socket.room) {
          io.to(socket.room).emit("typing_status", {
            users: await RedisService.getTypingUsers(socket.room),
            roomId: socket.room,
          });
        }
      } catch (error) {
        console.error(
          `[Socket Disconnect] Error during cleanup: ${error.message}`
        );
        // Final attempt to clean up in case of error
        try {
          await RedisService.forceCleanupSocket(socket.id);
        } catch {}
      }
    });

    // Ensure cleanup also happens on errors and connection termination
    socket.conn.on("close", async () => {
      console.log(`Socket connection closed: ${socket.id}`);
      try {
        await RedisService.forceCleanupSocket(socket.id);
        await cleanupSocketData(socket);
      } catch (error) {
        console.error(`[Socket Close] Error during cleanup: ${error.message}`);
      }
    });
  });
}
