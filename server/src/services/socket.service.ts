import { Server as SocketServer, Socket } from "socket.io";
import { Server } from "http";
import { socketAuthMiddleware } from "../middleware/SocketAuth.middleware";
import { RedisService } from "./redis.service";
import User from "../models/User.model";

export let io: SocketServer;

const handleConnection = async (socket: Socket) => {
  const socketId = socket.id;
  const mongoId = socket.mongoId;
  await RedisService.setSocketIdToMongoId(socketId, mongoId!);
  await RedisService.setMongoIdToSocketId(mongoId!, socketId);
  console.log(`${mongoId} connected with socket id ${socketId}`);
  RedisService.setOnlineStatus(mongoId!, true);

  const user = await User.findById(mongoId);
  if (!user) {
    socket.emit("error", "User not found");
    return;
  }
  const friends = user.friends;
  //send online status to all friends
  friends.forEach(async (friend) => {
    const friendSocketId = await RedisService.getSocketIdFromMongoId(friend);
    if (friendSocketId) {
      socket.to(friendSocketId).emit("online", mongoId);
    }
  });
};

const handleDisconnect = (socket: Socket) => {
  const mongoId = socket.mongoId;
  console.log(`${mongoId} disconnected`);
  RedisService.socketDisconnectProcess(socket.id, mongoId!);
};

export const initializeSocket = (server: Server) => {
  io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    handleConnection(socket);

    socket.on("disconnect", async () => {
      handleDisconnect(socket);
    });
  });

  return io;
};
