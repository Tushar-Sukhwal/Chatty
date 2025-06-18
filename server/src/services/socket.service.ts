import { Server as SocketServer, Socket } from "socket.io";
import { Server } from "http";
import { socketAuthMiddleware } from "../middleware/SocketAuth.middleware";
import { RedisService } from "./redis.service";
import User from "../models/User.model";
import Chat from "../models/Chat.model";
import { IMessageDocument } from "../types/models";
import { KafkaService } from "./kafka.service";
import { v4 as uuidv4 } from "uuid";

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

const handleSendMessage = async (
  socket: Socket,
  data: IMessageDocument,
  callback: (messageId: string) => void
) => {
  //generate uuid4 for messageId
  data.messageId = uuidv4();
  //push message to kafka
  await KafkaService.publishMessage("NEW_MESSAGE", data);
  //respond with the messageId
  callback(data.messageId);

  const chatId = data.chatId;
  const chat = await Chat.findById(chatId);
  chat?.participants.forEach(async (participant) => {
    if (participant.user.toString() !== data.senderId.toString()) {
      const participantSocketId = await RedisService.getSocketIdFromMongoId(
        participant.user
      );
      if (participantSocketId) {
        socket.to(participantSocketId).emit("newMessage", data);
      }
    }
  });
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

    // respond with the _id as uuid4.
    socket.on("sendMessage", async (data, callback) => {
      handleSendMessage(socket, data, callback);
    });

    socket.on("disconnect", async () => {
      handleDisconnect(socket);
    });
  });

  return io;
};
