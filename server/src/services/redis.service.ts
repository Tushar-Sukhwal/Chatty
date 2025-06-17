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

  static async socketDisconnectProcess(
    socketId: string,
    mongoId: Schema.Types.ObjectId
  ) {
    if (!mongoId) return;
    await this.setOnlineStatus(mongoId, false);
    await this.getSocketIdFromMongoId(mongoId);
    await this.getMongoIdFromSocketId(socketId);
  }
}
