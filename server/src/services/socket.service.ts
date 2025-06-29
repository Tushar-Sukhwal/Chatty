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
import { Schema } from "mongoose";

/**
 * Socket Service
 *
 * Centralises all Socket.IO real-time logic: connection lifecycle, authentication,
 * event handlers (send / edit / delete message, add chat, open chat) and room
 * management. Exported `initializeSocket` mounts the Socket.IO server on the
 * supplied HTTP server instance and returns the created `io` object.
 *
 * Every connected socket gets these custom properties attached in
 * `SocketAuth.middleware.ts`:
 *   • `socket.mongoId`   – MongoDB ObjectId of the authenticated user.
 *   • `socket.userName`  – The userName string.
 */

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

  user.chats.forEach(async chat => {
    await socket.join(chat.toString());
    socket.to(chat.toString()).emit("online", mongoId);
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
  user.chats.forEach(async chat => {
    socket.to(chat.toString()).emit("offline", mongoId);
    await socket.leave(chat.toString());
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
  const messageId = uuidv4();
  data.messageId = messageId;

  if (data.replyTo) {
    const replyToMessage = await Message.findOne({ messageId: data.replyTo });
    if (!replyToMessage) {
      callback("Reply to message not found");
      return;
    }
    data.replyTo = replyToMessage.messageId!;
  }

  // Push message to Kafka
  // await KafkaService.publishMessage("NEW_MESSAGE", data);

  // Push message to db
  const newMessage = await Message.create({
    ...data,
    messageId: messageId,
  });

  // Respond with the messageId

  const chatId = data.chatId;

  socket.to(chatId.toString()).emit("newMessage", data);
  callback(messageId);
};

const handleMessageDelete = async (
  socket: Socket,
  data: IMessageDocument,
  callback: (messageId: string) => void
) => {
  const message = await Message.findOne({ messageId: data.messageId });
  if (!message) {
    callback("Message not found");
    return;
  }
  //if the sender is the user, delete the message
  if (message.senderId.toString() !== socket.mongoId!.toString()) {
    callback("You are not authorized to delete this message");
    return;
  }
  //set the conent to "" and isDeleted to true
  message.content = "";
  message.deletedForEveryone = true;
  await message.save();
  callback("Message deleted successfully");
  socket.to(message.chatId.toString()).emit("updateDeleteMessage", message);
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

    //join all participants in the chat including the sender
    newChat.participants.forEach(async participant => {
      const participantSocketId = await RedisService.getSocketIdFromMongoId(participant.user);
      if (participantSocketId) {
        io.in(participantSocketId).socketsJoin(newChat._id.toString());
      }
    });

    socket.to(newChat._id.toString()).emit("updateAddChat", newChat);

    callback(JSON.stringify(newChat));
  }
};

const handleEditMessage = async (
  socket: Socket,
  data: { messageId: string; content: string },
  callback: (messageId: string) => void
) => {
  //TODO: add edit message to kafka

  const message = await Message.findOne({ messageId: data.messageId });
  if (!message) {
    callback(
      JSON.stringify({
        message: "Message not found",
        status: "error",
      })
    );
    return;
  }
  //user id from socket using redis
  const user = await RedisService.getMongoIdFromSocketId(socket.id);
  if (!user) {
    callback("User not found");
    return;
  }
  //check if the message is from the user
  if (message.senderId.toString() !== user.toString()) {
    callback(
      JSON.stringify({
        message: "You are not authorized to edit this message",
        status: "error",
      })
    );
    return;
  }
  //update the message
  message.content = data.content;
  message.isEdited = true;
  await message.save();
  callback(
    JSON.stringify({
      message: "Message edited successfully",
      status: "success",
      data: message,
    })
  );

  socket.to(message.chatId.toString()).emit("updateEditMessage", message);
};

const handleOpenChat = async (
  socket: Socket,
  data: { chatId: string },
  callback: (messageId: string) => void
) => {
  //TODO: add open chat to kafka

  if (data.chatId === "-1") {
    RedisService.delOpenChat(socket.mongoId!);
  }

  const mongoId = socket.mongoId;
  const chatId = new Schema.Types.ObjectId(data.chatId);
  RedisService.setOpenChat(mongoId!, chatId);
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
      handleEditMessage(socket, data, callback);
    });

    socket.on("deleteMessage", async (data, callback) => {
      handleMessageDelete(socket, data, callback);
    });

    socket.on("addChat", async (data, callback) => {
      handleAddChat(socket, data, callback);
    });

    socket.on("openChat", async (data, callback) => {
      handleOpenChat(socket, data, callback);
    });

    socket.on("disconnect", async () => {
      handleDisconnect(socket);
    });
  });

  return io;
};
