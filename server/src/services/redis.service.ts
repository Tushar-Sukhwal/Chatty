import { Schema } from "mongoose";
import redis from "../config/redis.config";

export class RedisService {
  //Online state management
  static async setOnlineStatus(
    mongoId: Schema.Types.ObjectId,
    isOnline: boolean
  ) {
    const key = `online:${mongoId}`;
    const value = isOnline ? "true" : "false";
    await redis.set(key, value);
  }

  static async setSocketIdToMongoId(
    socketId: string,
    mongoId: Schema.Types.ObjectId
  ) {
    const key = `socketIdToMongoId:${socketId}`;
    await redis.set(key, mongoId.toString());
  }

  static async setMongoIdToSocketId(
    mongoId: Schema.Types.ObjectId,
    socketId: string
  ) {
    const key = `mongoIdToSocketId:${mongoId}`;
    await redis.set(key, socketId);
  }

  static async setOpenChat(
    mongoId: Schema.Types.ObjectId,
    chatId: Schema.Types.ObjectId
  ) {
    const key = `openChat:${mongoId}`;
    await redis.set(key, chatId.toString());
  }

  static async getSocketIdFromMongoId(
    mongoId: Schema.Types.ObjectId
  ): Promise<string | null> {
    const key = `mongoIdToSocketId:${mongoId}`;
    return await redis.get(key);
  }

  static async getMongoIdFromSocketId(
    socketId: string
  ): Promise<string | null> {
    const key = `socketIdToMongoId:${socketId}`;
    return await redis.get(key);
  }

  static async getOnlineUsers(): Promise<string[]> {
    const keys = await redis.keys("online:*");
    return keys.map((key) => key.split(":")[1]);
  }

  static async getOnlineStatus(
    mongoId: Schema.Types.ObjectId
  ): Promise<boolean> {
    const key = `online:${mongoId}`;
    const value = await redis.get(key);
    return value === "true";
  }

  static async getOpenChat(
    mongoId: Schema.Types.ObjectId
  ): Promise<Schema.Types.ObjectId | null> {
    const key = `openChat:${mongoId}`;
    const chatId = await redis.get(key);
    return chatId ? new Schema.Types.ObjectId(chatId) : null;
  }

  static async delOpenChat(mongoId: Schema.Types.ObjectId) {
    const key = `openChat:${mongoId}`;
    await redis.del(key);
  }

  static async socketDisconnectProcess(
    socketId: string,
    mongoId: Schema.Types.ObjectId
  ) {
    if (!mongoId) return;
    await this.setOnlineStatus(mongoId, false);
    // Remove the mapping keys from Redis
    await redis.del(`mongoIdToSocketId:${mongoId}`);
    await redis.del(`socketIdToMongoId:${socketId}`);
    await redis.del(`openChat:${mongoId}`);
  }
}
