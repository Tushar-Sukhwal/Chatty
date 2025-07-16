import { producer, consumer, TOPICS } from "../config/kafka.config";
import Chat from "../models/Chat.model";
import Message from "../models/Message.model";
import User from "../models/User.model";
import { IMessageDocument, IChatDocument } from "../types/models";

export class KafkaService {
  /**
   * Publishes a message to a specified Kafka topic.
   *
   * This method takes a topic name and a message (of type IMessageDocument),
   * serializes the message to JSON, and sends it to the Kafka topic using the producer.
   * If an error occurs during publishing, it logs the error to the console.
   */
  static async publishMessage(topic: string, message: IMessageDocument | IChatDocument) {
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
      console.log(`Message published to topic ${topic}`);
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
          try {
            // Parse the message value from Kafka as JSON
            const data = JSON.parse(message.value?.toString() || "{}");
            console.log(`Processing message from topic: ${topic}`, data);

            // Route the message based on its type
            switch (topic) {
              case TOPICS.NEW_MESSAGE:
                await processNewMessage(data);
                break;
              case TOPICS.MESSAGE_STATUS_UPDATE:
                await processMessageStatusUpdate(data);
                break;
              case TOPICS.DELETE_MESSAGE:
                await processDeleteMessage(data);
                break;
              case TOPICS.ADD_CHAT:
                await processAddChat(data);
                break;
              default:
                console.log("Unknown message type:", topic);
            }
          } catch (error) {
            console.error(`Error processing message from topic ${topic}:`, error);
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
      messageId,
      chatId,
      senderId,
      content,
      type,
      status,
      deletedFor,
      deletedForEveryone,
      replyTo,
      sentAt,
      readAt,
      editedAt,
    } = data;

    // Check if message already exists to prevent duplicates
    const existingMessage = await Message.findOne({ messageId });
    if (existingMessage) {
      console.log("Message already exists, skipping:", messageId);
      return;
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log("Chat not found:", chatId);
      return;
    }

    const message = await Message.create({
      messageId,
      chatId,
      senderId,
      content,
      type,
      status,
      deletedFor,
      deletedForEveryone,
      replyTo,
      sentAt,
      readAt,
      editedAt,
    });

    console.log("New message processed:", message.messageId);
  } catch (error) {
    console.error("Error in processNewMessage:", error);
  }
};

const processMessageStatusUpdate = async (data: IMessageDocument) => {
  try {
    const { messageId, status, readAt } = data;

    const message = await Message.findOne({ messageId });
    if (!message) {
      console.log("Message not found for status update:", messageId);
      return;
    }

    if (status) message.status = status;
    if (readAt) message.readAt = readAt;

    await message.save();
    console.log("Message status updated:", messageId);
  } catch (error) {
    console.error("Error in processMessageStatusUpdate:", error);
  }
};

const processDeleteMessage = async (data: IMessageDocument) => {
  try {
    const { messageId, deletedFor, deletedForEveryone } = data;

    const message = await Message.findOne({ messageId });
    if (!message) {
      console.log("Message not found for deletion:", messageId);
      return;
    }

    if (deletedForEveryone !== undefined) {
      message.deletedForEveryone = deletedForEveryone;
      if (deletedForEveryone) {
        message.content = "";
      }
    }

    if (deletedFor) {
      message.deletedFor = deletedFor;
    }

    await message.save();
    console.log("Message deletion processed:", messageId);
  } catch (error) {
    console.error("Error in processDeleteMessage:", error);
  }
};

const processAddChat = async (data: IChatDocument) => {
  try {
    const { name, description, type, participants, createdBy } = data;

    // Check if chat already exists (for direct chats)
    if (type === "direct" && participants && participants.length === 2) {
      const existingChat = await Chat.findOne({
        type: "direct",
        participants: {
          $all: [participants[0].user, participants[1].user],
        },
      });

      if (existingChat) {
        console.log("Direct chat already exists, skipping");
        return;
      }
    }

    const chat = await Chat.create({
      name,
      description,
      type,
      participants,
      createdBy,
    });

    // Update all participants' chat lists
    if (participants) {
      for (const participant of participants) {
        await User.findByIdAndUpdate(participant.user, { $addToSet: { chats: chat._id } });
      }
    }

    console.log("New chat processed:", chat._id);
  } catch (error) {
    console.error("Error in processAddChat:", error);
  }
};
