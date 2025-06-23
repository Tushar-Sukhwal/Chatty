// src/services/SocketSingleton.ts
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { Message, User } from "@/types/types";
import { io, Socket } from "socket.io-client";

class SocketSingleton {
  private static instance: SocketSingleton;
  private socket: Socket;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {
    const socketEndpoint =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "https://list.tusharsukhwal.com";

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
      useChatStore.setState({
        messages: [...useChatStore.getState().messages, message],
      });
      console.log("New message received:", message);
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
  }) {
    let ret: string | null = null;
    this.socket.emit("sendMessage", messageData, (response: any) => {
      ret = response;
    });
    return ret;
  }
}

export default SocketSingleton;
