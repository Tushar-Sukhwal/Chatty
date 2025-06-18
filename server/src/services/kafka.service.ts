import { producer, consumer } from "../config/kafka.config";
import Chat from "../models/Chat.model";
import Message from "../models/Message.model";
import { IMessageDocument } from "../types/models";

export class KafkaService {
  /**
   * Publishes a message to a specified Kafka topic.
   *
   * This method takes a topic name and a message (of type IMessageDocument),
   * serializes the message to JSON, and sends it to the Kafka topic using the producer.
   * If an error occurs during publishing, it logs the error to the console.
   */
  static async publishMessage(topic: string, message: IMessageDocument) {
    try {
      await producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
    } catch (error) {
      console.error("Error publishing to Kafka:", error);
    }
  }

  /**
   * Starts the Kafka consumer to listen for messages on subscribed topics.
   *
   * This method runs the Kafka consumer and processes each incoming message.
   * For every message received, it parses the message value as JSON and checks the `type` field.
   * Depending on the type (e.g., "NEW_MESSAGE", "MESSAGE_STATUS_UPDATE", "DELETE_MESSAGE"),
   * it delegates handling to the appropriate function (here, `handleMessageFromKafka`).
   * If the message type is unknown, it logs a warning.
   * Any errors during consumer operation are caught and logged.
   */
  static async startConsumer() {
    try {
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          // Parse the message value from Kafka as JSON
          const data = JSON.parse(message.value?.toString() || "{}");

          // Route the message based on its type
          switch (topic) {
            case "NEW_MESSAGE":
              await processNewMessage(data);
              break;
            case "MESSAGE_STATUS_UPDATE":
              await processMessageStatusUpdate(data);
              break;
            case "DELETE_MESSAGE":
              await processDeleteMessage(data);
              break;
            default:
              console.log("Unknown message type:", topic);
          }
        },
      });
    } catch (error) {
      console.error("Error in Kafka consumer:", error);
    }
  }
}

const processNewMessage = async (data: IMessageDocument) => {
  try {
    const {
      chatId,
      senderId,
      content,
      type,
      status,
      deletedFor,
      deletedForEveryone,
      replyTo,
      sentAt,
      // deliveredAt,
      readAt,
      editedAt,
    } = data;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log("Chat not found");
      return;
    }

    const message = await Message.create({
      chatId,
      senderId,
      content,
      type,
      status,
      deletedFor,
      deletedForEveryone,
      replyTo,
      sentAt,
      // deliveredAt,
      readAt,
      editedAt,
    });
  } catch (error) {
    console.error("Error in processNewMessage:", error);
  }
};

const processMessageStatusUpdate = async (message: IMessageDocument) => {};

const processDeleteMessage = async (message: IMessageDocument) => {};
