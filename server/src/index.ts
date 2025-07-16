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
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { connectKafkaProducer, connectKafkaConsumer, disconnectKafka } from "./config/kafka.config";
import { KafkaService } from "./services/kafka.service";

/* CONFIGURATION */
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const swaggerDocument = YAML.load(path.resolve("src/docs/openapi.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is Home route ");
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

const initializeServices = async () => {
  try {
    await connectDB();

    // Initialize Kafka
    await connectKafkaProducer();
    await connectKafkaConsumer();
    await KafkaService.startConsumer();

    console.log("All services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = initializeSocket(server);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await disconnectKafka();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await disconnectKafka();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Initialize services and start server
initializeServices().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export { io };
