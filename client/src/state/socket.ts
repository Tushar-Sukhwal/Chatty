import { io, Socket } from "socket.io-client";
import { addMessage, editMessage, updateMessageStatus } from "./index";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(token: string) {
    // Only create a new socket if one doesn't exist or is not connected
    if (!this.socket || !this.socket.connected) {
      this.token = token;

      this.socket = io(process.env.NEXT_PUBLIC_API_URL, {
        auth: {
          token,
        },
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("Socket connected", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Socket disconnected", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.log("Socket connection error", error);
      });

      this.socket.on("error", (error) => {
        console.log("Socket error", error);
      });

      this.socket.on("delivered", (data) => {
        //update the message status to delivered
        updateMessageStatus({
          chatId: data.chatId,
          messageId: data.messageId,
          status: "delivered",
        });
      });

      this.socket.on("newMessage", (data, callback) => {
        //add the message to state
        addMessage(data);
        //callback with the delivery status
        callback(true);
      });

      this.socket.on("updateEditMessage", (data, callback) => {
        //update the message in state
        editMessage(data);
        //callback with the delivery status
        callback(true);
      });

      
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Message operations
  /**
   * Emits a message to the server (without an _id), waits for the server to respond with the _id,
   * then merges the _id into the message and adds it to state.
   * @param data - Message data (without _id)
   */
  sendMessageWithAck(data: {
    chatId: string;
    senderId: string;
    content: string;
    type: string;
    status: string; // sending, sent, delivered, read, edited, deleted
    replyTo: string;
    sentAt: Date;
    deliveredAt?: Date;
    readAt: Date;
    editedAt: Date;
  }) {
    if (!this.socket) return;
    // Send message to server without _id
    this.socket.emit("sendMessage", data, (serverMessage: any) => {
      // serverMessage should contain the _id and any other server-generated fields
      // Merge the _id into the original message data
      const updatedMessage = { ...data, messageId: serverMessage.messageId };
      // Store the updated message in state
      addMessage(updatedMessage);
    });
  }

  editMessage(data: {
    chatId: string;
    messageId: string;
    senderId: string;
    content: string;
    type: string;
    status: string; // sending, sent, delivered, read, edited, deleted
    replyTo: string;
    sentAt: Date;
    deliveredAt?: Date;
    readAt: Date;
    editedAt: Date;
  }) {
    if (!this.socket) return;
    this.socket.emit("editMessage", data, (ack: string) => {
      //TODO: trigger toast notification

      if (ack != "Message not allowed to edit") {
        //update the message in state
        editMessage(data);
      }
    });
  }
}

export default SocketService.getInstance();
