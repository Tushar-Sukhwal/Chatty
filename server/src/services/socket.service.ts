import { Server as SocketServer, Socket } from "socket.io";
import { Server } from "http";
import { socketAuthMiddleware } from "../middleware/SocketAuth.middleware";

export let io: SocketServer;

export const initializeSocket = (server: Server) => {
  io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log("A user connected");
  });

  return io;
};
