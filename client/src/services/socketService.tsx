// src/services/SocketSingleton.ts
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { Message, User } from "@/types/types";
import { io, Socket } from "socket.io-client";
import { UserApi } from "@/api/userApi";
import { toast } from "sonner";

class SocketSingleton {
  private static instance: SocketSingleton;
  private socket: Socket;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {
    const socketEndpoint = process.env.NEXT_PUBLIC_API_URL;
    console.log("socketEndpoint", socketEndpoint);
    const user = localStorage.getItem("user-store");
    const token = user ? JSON.parse(user).state.socketToken : null;
    this.socket = io(socketEndpoint, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    this.setupEventListeners();
  }

  public static getInstance(): SocketSingleton {
    if (!SocketSingleton.instance) {
      SocketSingleton.instance = new SocketSingleton();
    }
    return SocketSingleton.instance;
  }

  private setupEventListeners(): void {
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      this.reconnectAttempts = 0;
    });

    this.socket.on("newMessage", (message: Message) => {
      //if the message is from the current user, don't add it to the messages
      if (
        message.senderId.toString() ===
        useUserStore.getState().user?._id.toString()
      ) {
        return;
      }
      useChatStore.setState({
        messages: [...useChatStore.getState().messages, message],
      });
    });

    this.socket.on("online", (userId: string) => {
      useUserStore.setState((state) => ({
        onlineUsers: [...(state.onlineUsers || []), userId],
      }));
    });

    this.socket.on("offline", (userId: string) => {
      useUserStore.setState((state) => ({
        onlineUsers: state.onlineUsers?.filter((id) => id !== userId),
      }));
    });

    this.socket.on("triggerChatUpdate", async (data: any) => {
      const user = await UserApi.getMe();
      useUserStore.setState({ user });
    });

    this.socket.on("updateEditMessage", (message: Message) => {
      console.log("Message edited:", message);
      useChatStore.setState({
        messages: useChatStore
          .getState()
          .messages.map((m) =>
            m.messageId === message.messageId ? message : m
          ),
      });
    });

    this.socket.on("updateDeleteMessage", (message: Message) => {
      console.log("Message deleted:", message);
      useChatStore.setState({
        messages: useChatStore
          .getState()
          .messages.map((m) =>
            m.messageId === message.messageId ? message : m
          ),
      });
    });
  }

  public connect(): void {
    if (!this.isConnected && !this.socket.connected) {
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.isConnected || this.socket.connected) {
      this.socket.disconnect();
    }
  }

  public sendMessage(messageData: {
    content: string;
    chatId: string;
    senderId: string;
    createdAt: Date;
    replyToMessageId?: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      // Prepare the data to send to server, mapping replyToMessageId to replyTo if provided
      const serverMessageData = {
        ...messageData,
        ...(messageData.replyToMessageId && {
          replyTo: messageData.replyToMessageId,
        }),
      };

      this.socket.emit("sendMessage", serverMessageData, (response: any) => {
        console.log("ret", response);
        resolve(response);
      });
    });
  }

  public editMessage(messageId: string, content: string) {
    this.socket.emit("editMessage", { messageId, content }, (response: any) => {
      const res = JSON.parse(response);
      if (res.status === "success") {
        useChatStore.setState({
          messages: useChatStore
            .getState()
            .messages.map((message) =>
              message.messageId === messageId ? res.data : message
            ),
        });
      } else {
        return false;
      }
    });
    return true;
  }

  public openChat(chatId: string) {
    this.socket.emit("openChat", chatId, (response: any) => {
      console.log("ret", response);
    });
  }

  public deleteMessage(messageId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.emit("deleteMessage", { messageId }, (response: any) => {
        console.log("Delete message response:", response);
        if (response === "Message deleted successfully") {
          // Update the local state to show the message as deleted
          useChatStore.setState({
            messages: useChatStore
              .getState()
              .messages.map((m) =>
                m.messageId === messageId
                  ? { ...m, content: "", deletedForEveryone: true }
                  : m
              ),
          });
          resolve(response);
        } else {
          reject(response);
        }
      });
    });
  }
}

export default SocketSingleton;
