import { Server as SocketServer, Socket } from "socket.io";
import { Server } from "http";
import { socketAuthMiddleware } from "../middleware/SocketAuth.middleware";
import { RedisService } from "./redis.service";
import User from "../models/User.model";
import Chat from "../models/Chat.model";
import Message from "../models/Message.model";
import { IChatDocument, IMessageDocument } from "../types/models";
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

const handleDisconnect = async (socket: Socket) => {
  const mongoId = socket.mongoId;
  console.log(`${mongoId} disconnected`);
  RedisService.socketDisconnectProcess(socket.id, mongoId!);

  const user = await User.findById(mongoId);
  if (!user) {
    socket.emit("error", "User not found");
    return;
  }
  const friends = user.friends;
  //send offline status to all friends
  friends.forEach(async (friend) => {
    const friendSocketId = await RedisService.getSocketIdFromMongoId(friend);
    if (friendSocketId) {
      socket.to(friendSocketId).emit("offline", mongoId);
    }
  });
};

/**
 * Handles the "sendMessage" socket event.
 *
 * This function is responsible for processing a new message sent by a user.
 * It performs the following steps:
 * 1. Generates a unique UUIDv4 for the message and assigns it to `data.messageId`.
 * 2. Publishes the message to Kafka with the topic "NEW_MESSAGE" for further processing.
 * 3. Responds to the sender with the generated `messageId` via the provided callback.
 * 4. Retrieves the chat by `chatId` and iterates over all participants except the sender.
 * 5. For each participant (excluding the sender), retrieves their socket ID from Redis.
 * 6. If the participant is online (socket ID exists), emits a "newMessage" event to their socket with the message data.
 * 7. If the message is delivered and the chat type is "direct", emits a "delivered" event back to the sender with the `messageId`.
 *
 * @param {Socket} socket - The socket instance of the sender.
 * @param {IMessageDocument} data - The message data to be sent.
 * @param {(messageId: string) => void} callback - Callback to respond to the sender with the generated message ID.
 */
const handleSendMessage = async (
  socket: Socket,
  data: IMessageDocument,
  callback: (messageId: string) => void
) => {
  console.log("sendMessage", data);
  // Generate uuid4 for messageId
  data.messageId = uuidv4();

  // Push message to Kafka
  // await KafkaService.publishMessage("NEW_MESSAGE", data);

  // Push message to db
  const newMessage = await Message.create(data);

  // Respond with the messageId
  callback(data.messageId);

  const chatId = data.chatId;
  const chat = await Chat.findById(chatId);

  // Notify all participants except the sender
  chat?.participants.forEach(async (participant) => {
    if (participant.user.toString() !== data.senderId.toString()) {
      const participantSocketId = await RedisService.getSocketIdFromMongoId(
        participant.user
      );
      if (participantSocketId) {
        socket
          .to(participantSocketId)
          .emit("newMessage", data, (deliveryStatus: boolean) => {
            // If delivered and chat is direct, notify sender
            if (deliveryStatus && chat?.type === "direct") {
              socket.emit("delivered", {
                messageId: data.messageId,
                chatId: chatId,
              });
            }
          });
      }
    }
  });
};

const handleMessageEdit = async (
  socket: Socket,
  data: IMessageDocument,
  callback: (messageId: string) => void
) => {
  const msgFromDb = await Message.findById(data.messageId);
  if (!msgFromDb) {
    callback("Message not found");
    return;
  }

  //chatId, messageId, senderId, type, replyTo, sentAt, deliverdAt, readAt should be same
  if (
    msgFromDb.chatId !== data.chatId ||
    msgFromDb.messageId !== data.messageId ||
    msgFromDb.senderId !== data.senderId ||
    msgFromDb.type !== data.type ||
    msgFromDb.replyTo !== data.replyTo ||
    msgFromDb.sentAt !== data.sentAt ||
    msgFromDb.readAt !== data.readAt
  ) {
    callback("Message not allowed to edit");
    return;
  }
  //kafka
  await KafkaService.publishMessage("EDIT_MESSAGE", data); //TODO: add edit message to kafka

  //notify all participants except the sender
  const chat = await Chat.findById(data.chatId);
  chat?.participants.forEach(async (participant) => {
    if (participant.user.toString() !== data.senderId.toString()) {
      const participantSocketId = await RedisService.getSocketIdFromMongoId(
        participant.user
      );
      if (participantSocketId) {
        socket.to(participantSocketId).emit("updateEditMessage", data);
      }
    }
  });
  callback("Message edited successfully");
};

const handleMessageDelete = async (
  socket: Socket,
  data: IMessageDocument,
  callback: (messageId: string) => void
) => {
  //TODO: add delete message to kafka
  //TODO: notify all participants except the sender
  const chat = await Chat.findById(data.chatId);
  chat?.participants.forEach(async (participant) => {
    if (participant.user.toString() !== data.senderId.toString()) {
      const participantSocketId = await RedisService.getSocketIdFromMongoId(
        participant.user
      );
      if (participantSocketId) {
        socket.to(participantSocketId).emit("updateDeleteMessage", data);
      }
    }
  });
};

const handleAddChat = async (
  socket: Socket,
  data: IChatDocument,
  callback: (messageId: string) => void
) => {
  //TODO: notify all participants except the sender
  if (data.type === "direct") {
    //check if the chat already exists
    const chat = await Chat.findOne({
      type: "direct",
      participants: {
        $all: [data.participants[0].user, data.participants[1].user],
      },
    });
    // for each user update the chat in db through kafka
    // TODO KafkaService.publishMessage("ADD_CHAT", data);

    if (chat) {
      callback("Chat already exists");
      return;
    }
    //enter into db
    const newChat = await Chat.create(data);
    //notify all participants except the sender
    newChat.participants.forEach(async (participant) => {
      const participantSocketId = await RedisService.getSocketIdFromMongoId(
        participant.user
      );
      if (participantSocketId) {
        socket.to(participantSocketId).emit("updateAddChat", newChat);
      }
    });
    callback(JSON.stringify(newChat));
  }
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

    socket.on("sendMessage", async (data, callback) => {
      handleSendMessage(socket, data, callback);
    });

    socket.on("editMessage", async (data, callback) => {
      handleMessageEdit(socket, data, callback);
    });

    socket.on("deleteMessage", async (data, callback) => {
      handleMessageDelete(socket, data, callback);
    });

    socket.on("addChat", async (data, callback) => {
      handleAddChat(socket, data, callback);
    });

    socket.on("disconnect", async () => {
      handleDisconnect(socket);
    });
  });

  return io;
};
