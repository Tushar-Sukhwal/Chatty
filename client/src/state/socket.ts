import { io, Socket } from "socket.io-client";
import { addMessage } from "./index";

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
  sendMessageWithAck(
    data: {
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
    },
  ) {
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
}

export default SocketService.getInstance();
