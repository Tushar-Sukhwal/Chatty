/**
 * Kafka Configuration
 *
 * Provides pre-configured `producer` and `consumer` instances as well as helper
 * functions to establish connections.
 *
 * Topic names are loaded from environment variables where required.
 */
// src/config/kafka.config.ts
import { Kafka, logLevel } from "kafkajs";

const brokers = ["localhost:9092"];

export const kafka = new Kafka({
  brokers,
  logLevel: logLevel.ERROR,
  clientId: "chatty-app",
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "chatty-group" });
export const admin = kafka.admin();

// Define all topics used in the application
export const TOPICS = {
  NEW_MESSAGE: "NEW_MESSAGE",
  MESSAGE_STATUS_UPDATE: "MESSAGE_STATUS_UPDATE",
  DELETE_MESSAGE: "DELETE_MESSAGE",
  ADD_CHAT: "ADD_CHAT",
} as const;

export const createTopics = async () => {
  try {
    await admin.connect();
    console.log("Kafka Admin connected...");

    const topics = Object.values(TOPICS);
    const existingTopics = await admin.listTopics();
    const topicsToCreate = topics.filter(topic => !existingTopics.includes(topic));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map(topic => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        })),
      });
      console.log(`Created topics: ${topicsToCreate.join(", ")}`);
    } else {
      console.log("All topics already exist");
    }

    await admin.disconnect();
  } catch (error) {
    console.error("Error creating topics:", error);
    throw error;
  }
};

export const connectKafkaProducer = async () => {
  try {
    await producer.connect();
    console.log("Kafka Producer connected...");
  } catch (error) {
    console.error("Failed to connect Kafka Producer:", error);
    throw error;
  }
};

export const connectKafkaConsumer = async () => {
  try {
    await consumer.connect();

    // Create topics first
    await createTopics();

    // Subscribe to all topics
    const topics = Object.values(TOPICS);

    for (const topic of topics) {
      await consumer.subscribe({ topic });
      console.log(`Subscribed to topic: ${topic}`);
    }

    console.log("Kafka Consumer connected and subscribed to topics...");
  } catch (error) {
    console.error("Failed to connect Kafka Consumer:", error);
    throw error;
  }
};

export const disconnectKafka = async () => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    console.log("Kafka connections closed");
  } catch (error) {
    console.error("Error disconnecting Kafka:", error);
  }
};
