import redis from "../config/redis.js";

// Keys for Redis
const ONLINE_USERS_KEY = "online_users"; // Hash mapping socket_id to user_id
const USER_SOCKETS_KEY = "user_sockets"; // Hash mapping user_id to array of socket_ids
const TYPING_USERS_KEY = "typing_users"; // Hash mapping chat_id to array of typing user_ids

export class RedisService {
  // Online status management
  static async addOnlineUser(socketId: string, userId: string): Promise<void> {
    await redis.hset(ONLINE_USERS_KEY, socketId, userId);

    // Also track which sockets belong to which user (for multiple connections)
    const userSockets = await redis.hget(USER_SOCKETS_KEY, userId);
    const sockets = userSockets ? JSON.parse(userSockets) : [];
    sockets.push(socketId);
    await redis.hset(USER_SOCKETS_KEY, userId, JSON.stringify(sockets));
  }

  static async removeOnlineUser(socketId: string): Promise<void> {
    const userId = await redis.hget(ONLINE_USERS_KEY, socketId);
    if (userId) {
      // Remove socket from the user's socket list
      const userSockets = await redis.hget(USER_SOCKETS_KEY, userId);
      if (userSockets) {
        const sockets = JSON.parse(userSockets).filter(
          (id: string) => id !== socketId
        );
        if (sockets.length > 0) {
          await redis.hset(USER_SOCKETS_KEY, userId, JSON.stringify(sockets));
        } else {
          // If no more sockets, remove the user from user_sockets
          await redis.hdel(USER_SOCKETS_KEY, userId);
        }
      }
    }

    // Remove socket from online users
    await redis.hdel(ONLINE_USERS_KEY, socketId);
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
}
