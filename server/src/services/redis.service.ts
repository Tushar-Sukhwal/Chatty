import redis from "../config/redis.js";

// Keys for Redis
export const ONLINE_USERS_KEY = "online_users"; // Hash mapping socket_id to user_id
export const USER_SOCKETS_KEY = "user_sockets"; // Hash mapping user_id to array of socket_ids
export const TYPING_USERS_KEY = "typing_users"; // Hash mapping chat_id to array of typing user_ids
export const USER_ROOMS_KEY = "user_rooms"; // Hash mapping user_id to array of room_ids

// Default TTL for socket-related entries in seconds (30 minutes)
export const DEFAULT_SOCKET_TTL = 30 * 60;

export class RedisService {
  // Online status management
  static async addOnlineUser(socketId: string, userId: string): Promise<void> {
    // Set socket to user mapping with TTL
    await redis.hset(ONLINE_USERS_KEY, socketId, userId);

    // Also track which sockets belong to which user (for multiple connections)
    const userSockets = await redis.hget(USER_SOCKETS_KEY, userId);
    const sockets = userSockets ? JSON.parse(userSockets) : [];
    if (!sockets.includes(socketId)) {
      sockets.push(socketId);
      await redis.hset(USER_SOCKETS_KEY, userId, JSON.stringify(sockets));
    }

    // Set TTL on the entire hash if not already set
    await redis.expire(ONLINE_USERS_KEY, DEFAULT_SOCKET_TTL);
    await redis.expire(USER_SOCKETS_KEY, DEFAULT_SOCKET_TTL);
  }

  static async removeOnlineUser(socketId: string): Promise<void> {
    const userId = await redis.hget(ONLINE_USERS_KEY, socketId);
    console.log(
      `[removeOnlineUser] Socket ID: ${socketId}, User ID from ONLINE_USERS_KEY: ${userId}`
    );

    if (userId) {
      // Remove socket from the user's socket list
      const userSocketsRaw = await redis.hget(USER_SOCKETS_KEY, userId);
      console.log(
        `[removeOnlineUser] User ID: ${userId}, Raw sockets from USER_SOCKETS_KEY: ${userSocketsRaw}`
      );

      if (userSocketsRaw) {
        try {
          let sockets: string[] = JSON.parse(userSocketsRaw);
          console.log(
            `[removeOnlineUser] User ID: ${userId}, Sockets before removal: ${JSON.stringify(
              sockets
            )}`
          );

          sockets = sockets.filter((id: string) => id !== socketId);
          console.log(
            `[removeOnlineUser] User ID: ${userId}, Sockets after removal: ${JSON.stringify(
              sockets
            )}`
          );

          if (sockets.length > 0) {
            await redis.hset(USER_SOCKETS_KEY, userId, JSON.stringify(sockets));
            console.log(
              `[removeOnlineUser] User ID: ${userId}, Updated USER_SOCKETS_KEY with remaining sockets.`
            );
          } else {
            // If no more sockets, remove the user from user_sockets
            await redis.hdel(USER_SOCKETS_KEY, userId);
            console.log(
              `[removeOnlineUser] User ID: ${userId}, Deleted from USER_SOCKETS_KEY as no sockets remain.`
            );
          }
        } catch (error) {
          console.error(
            `[removeOnlineUser] Error parsing socket data: ${error.message}`
          );
          // If parsing fails, try to remove the corrupt data
          await redis.hdel(USER_SOCKETS_KEY, userId);
          console.log(
            `[removeOnlineUser] Removed potentially corrupt socket data for user ${userId}`
          );
        }
      } else {
        console.log(
          `[removeOnlineUser] User ID: ${userId}, No socket list found in USER_SOCKETS_KEY.`
        );
      }
    } else {
      console.log(
        `[removeOnlineUser] Socket ID: ${socketId}, No User ID found in ONLINE_USERS_KEY. Cannot remove from USER_SOCKETS_KEY.`
      );
    }

    // Remove socket from online users
    const hdelResult = await redis.hdel(ONLINE_USERS_KEY, socketId);
    console.log(
      `[removeOnlineUser] Socket ID: ${socketId}, Result of HDEL on ONLINE_USERS_KEY: ${hdelResult}. User should now be offline if this was the last socket.`
    );
  }

  static async isUserOnline(userId: string): Promise<boolean> {
    const userSockets = await redis.hget(USER_SOCKETS_KEY, userId);
    return userSockets !== null && JSON.parse(userSockets).length > 0;
  }

  static async getOnlineUsers(): Promise<string[]> {
    const users = await redis.hkeys(USER_SOCKETS_KEY);
    return users;
  }

  // Typing status management
  static async setUserTyping(chatId: string, userId: string): Promise<void> {
    const typingUsers = await redis.hget(TYPING_USERS_KEY, chatId);
    const users = typingUsers ? JSON.parse(typingUsers) : [];

    if (!users.includes(userId)) {
      users.push(userId);
      await redis.hset(TYPING_USERS_KEY, chatId, JSON.stringify(users));
    }

    // Auto-expire typing status after 5 seconds if not refreshed
    setTimeout(async () => {
      await RedisService.removeUserTyping(chatId, userId);
    }, 5000);
  }

  static async removeUserTyping(chatId: string, userId: string): Promise<void> {
    const typingUsers = await redis.hget(TYPING_USERS_KEY, chatId);
    if (typingUsers) {
      const users = JSON.parse(typingUsers).filter(
        (id: string) => id !== userId
      );
      if (users.length > 0) {
        await redis.hset(TYPING_USERS_KEY, chatId, JSON.stringify(users));
      } else {
        await redis.hdel(TYPING_USERS_KEY, chatId);
      }
    }
  }

  static async getTypingUsers(chatId: string): Promise<string[]> {
    const typingUsers = await redis.hget(TYPING_USERS_KEY, chatId);
    return typingUsers ? JSON.parse(typingUsers) : [];
  }

  // Track which rooms a user joins
  static async addUserToRoom(userId: string, roomId: string): Promise<void> {
    const userRooms = await redis.hget(USER_ROOMS_KEY, userId);
    const rooms = userRooms ? JSON.parse(userRooms) : [];

    if (!rooms.includes(roomId)) {
      rooms.push(roomId);
      await redis.hset(USER_ROOMS_KEY, userId, JSON.stringify(rooms));
      console.log(`[addUserToRoom] Added user ${userId} to room ${roomId}`);
    }
  }

  // Get all rooms a user is in
  static async getUserRooms(userId: string): Promise<string[]> {
    const userRooms = await redis.hget(USER_ROOMS_KEY, userId);
    return userRooms ? JSON.parse(userRooms) : [];
  }

  // Remove a user from a room
  static async removeUserFromRoom(
    userId: string,
    roomId: string
  ): Promise<void> {
    const userRooms = await redis.hget(USER_ROOMS_KEY, userId);

    if (userRooms) {
      const rooms = JSON.parse(userRooms).filter((id: string) => id !== roomId);

      if (rooms.length > 0) {
        await redis.hset(USER_ROOMS_KEY, userId, JSON.stringify(rooms));
      } else {
        await redis.hdel(USER_ROOMS_KEY, userId);
      }

      console.log(
        `[removeUserFromRoom] Removed user ${userId} from room ${roomId}`
      );
    }
  }

  // Method to clean up stale Redis entries
  static async cleanupStaleEntries(): Promise<void> {
    try {
      console.log("[Redis Cleanup] Starting cleanup of stale entries");

      // 1. Get all socket IDs from ONLINE_USERS_KEY
      const socketIds = await redis.hkeys(ONLINE_USERS_KEY);
      console.log(
        `[Redis Cleanup] Found ${socketIds.length} socket entries to check`
      );

      // 2. Get all user IDs from USER_SOCKETS_KEY
      const userIds = await redis.hkeys(USER_SOCKETS_KEY);
      console.log(
        `[Redis Cleanup] Found ${userIds.length} user entries to check`
      );

      // 3. Check for inconsistencies in user socket lists
      for (const userId of userIds) {
        const userSocketsRaw = await redis.hget(USER_SOCKETS_KEY, userId);
        if (!userSocketsRaw) {
          // No socket list for this user, remove the entry
          await redis.hdel(USER_SOCKETS_KEY, userId);
          // Also remove from USER_ROOMS_KEY since user is offline
          await redis.hdel(USER_ROOMS_KEY, userId);
          console.log(
            `[Redis Cleanup] Removed empty socket list for user ${userId} and cleared room memberships`
          );
          continue;
        }

        try {
          const userSockets = JSON.parse(userSocketsRaw);
          if (!Array.isArray(userSockets) || userSockets.length === 0) {
            // Empty socket list, remove the user
            await redis.hdel(USER_SOCKETS_KEY, userId);
            // Also remove from USER_ROOMS_KEY since user is offline
            await redis.hdel(USER_ROOMS_KEY, userId);
            console.log(
              `[Redis Cleanup] Removed user ${userId} with empty socket list and cleared room memberships`
            );
            continue;
          }

          // Check if each socket in the list exists in ONLINE_USERS_KEY
          const validSockets = [];
          for (const socketId of userSockets) {
            const socketUserId = await redis.hget(ONLINE_USERS_KEY, socketId);
            if (socketUserId === userId) {
              validSockets.push(socketId);
            }
          }

          if (validSockets.length === 0) {
            // No valid sockets left, remove the user
            await redis.hdel(USER_SOCKETS_KEY, userId);
            // Also remove from USER_ROOMS_KEY since user is offline
            await redis.hdel(USER_ROOMS_KEY, userId);
            console.log(
              `[Redis Cleanup] Removed user ${userId} with no valid sockets and cleared room memberships`
            );
          } else if (validSockets.length !== userSockets.length) {
            // Update the socket list with only valid sockets
            await redis.hset(
              USER_SOCKETS_KEY,
              userId,
              JSON.stringify(validSockets)
            );
            console.log(
              `[Redis Cleanup] Updated socket list for user ${userId}: ${validSockets.length} valid sockets`
            );

            // Reset TTL on updated user entries
            await redis.expire(USER_SOCKETS_KEY, DEFAULT_SOCKET_TTL);
          }
        } catch (error) {
          // Invalid JSON, remove the entry
          await redis.hdel(USER_SOCKETS_KEY, userId);
          // Also remove from USER_ROOMS_KEY since data is corrupt
          await redis.hdel(USER_ROOMS_KEY, userId);
          console.log(
            `[Redis Cleanup] Removed corrupt socket list for user ${userId} and cleared room memberships: ${error.message}`
          );
        }
      }

      // 4. Check user rooms data for consistency
      const userRoomIds = await redis.hkeys(USER_ROOMS_KEY);
      console.log(
        `[Redis Cleanup] Found ${userRoomIds.length} users with room data`
      );

      for (const userId of userRoomIds) {
        // Check if user exists in USER_SOCKETS_KEY (is online)
        const userSockets = await redis.hget(USER_SOCKETS_KEY, userId);

        if (!userSockets) {
          // User is not online, remove room memberships
          await redis.hdel(USER_ROOMS_KEY, userId);
          console.log(
            `[Redis Cleanup] Removed room memberships for offline user ${userId}`
          );
          continue;
        }

        // Validate room data
        const userRoomsRaw = await redis.hget(USER_ROOMS_KEY, userId);

        if (!userRoomsRaw) {
          await redis.hdel(USER_ROOMS_KEY, userId);
          continue;
        }

        try {
          const rooms = JSON.parse(userRoomsRaw);
          if (!Array.isArray(rooms) || rooms.length === 0) {
            await redis.hdel(USER_ROOMS_KEY, userId);
            console.log(
              `[Redis Cleanup] Removed empty room list for user ${userId}`
            );
          }
        } catch (error) {
          await redis.hdel(USER_ROOMS_KEY, userId);
          console.log(
            `[Redis Cleanup] Removed corrupt room data for user ${userId}: ${error.message}`
          );
        }
      }

      // 5. Check all typing users entries
      const chatIds = await redis.hkeys(TYPING_USERS_KEY);
      console.log(
        `[Redis Cleanup] Found ${chatIds.length} chat rooms with typing users`
      );

      for (const chatId of chatIds) {
        const typingUsersRaw = await redis.hget(TYPING_USERS_KEY, chatId);
        if (!typingUsersRaw) {
          await redis.hdel(TYPING_USERS_KEY, chatId);
          continue;
        }

        try {
          const typingUsers = JSON.parse(typingUsersRaw);
          if (!Array.isArray(typingUsers) || typingUsers.length === 0) {
            await redis.hdel(TYPING_USERS_KEY, chatId);
            console.log(
              `[Redis Cleanup] Removed empty typing users list for chat ${chatId}`
            );
            continue;
          }

          // Check if each typing user is still online
          const stillTypingUsers = [];
          for (const userId of typingUsers) {
            if (await RedisService.isUserOnline(userId)) {
              stillTypingUsers.push(userId);
            }
          }

          if (stillTypingUsers.length === 0) {
            await redis.hdel(TYPING_USERS_KEY, chatId);
            console.log(
              `[Redis Cleanup] Removed typing users for chat ${chatId} as no users are online`
            );
          } else if (stillTypingUsers.length !== typingUsers.length) {
            await redis.hset(
              TYPING_USERS_KEY,
              chatId,
              JSON.stringify(stillTypingUsers)
            );
            console.log(
              `[Redis Cleanup] Updated typing users for chat ${chatId}: ${stillTypingUsers.length} users`
            );
          }
        } catch (error) {
          await redis.hdel(TYPING_USERS_KEY, chatId);
          console.log(
            `[Redis Cleanup] Removed corrupt typing users for chat ${chatId}: ${error.message}`
          );
        }
      }

      // Force expire all keys to ensure cleanup
      await redis.expire(ONLINE_USERS_KEY, DEFAULT_SOCKET_TTL);
      await redis.expire(USER_SOCKETS_KEY, DEFAULT_SOCKET_TTL);
      await redis.expire(TYPING_USERS_KEY, DEFAULT_SOCKET_TTL);
      await redis.expire(USER_ROOMS_KEY, DEFAULT_SOCKET_TTL);

      console.log("[Redis Cleanup] Completed cleanup of stale entries");
    } catch (error) {
      console.error(`[Redis Cleanup] Error during cleanup: ${error.message}`);
    }
  }

  // Force cleanup of all Redis data for a specific socket ID
  static async forceCleanupSocket(socketId: string): Promise<void> {
    try {
      const userId = await redis.hget(ONLINE_USERS_KEY, socketId);

      // Remove from online users
      await redis.hdel(ONLINE_USERS_KEY, socketId);

      if (userId) {
        // Remove from user sockets list
        const userSocketsRaw = await redis.hget(USER_SOCKETS_KEY, userId);
        if (userSocketsRaw) {
          try {
            const sockets = JSON.parse(userSocketsRaw).filter(
              (id: string) => id !== socketId
            );

            if (sockets.length > 0) {
              await redis.hset(
                USER_SOCKETS_KEY,
                userId,
                JSON.stringify(sockets)
              );
            } else {
              await redis.hdel(USER_SOCKETS_KEY, userId);
              // Also clean up room memberships if no sockets left
              await redis.hdel(USER_ROOMS_KEY, userId);
            }
          } catch (error) {
            // If parsing fails, remove the corrupt data
            await redis.hdel(USER_SOCKETS_KEY, userId);
          }
        }
      }

      console.log(`[forceCleanupSocket] Forced cleanup for socket ${socketId}`);
    } catch (error) {
      console.error(`[forceCleanupSocket] Error: ${error.message}`);
    }
  }
}
