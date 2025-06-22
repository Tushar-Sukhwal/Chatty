import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.config";
/* ROUTE IMPORTS */
import authRoutes from "./routes/auth.routes";
import http from "http";
import { initializeSocket } from "./services/socket.service";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";

/* CONFIGURATION */
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is Home route ");
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes); 

connectDB();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
