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

const url = "localhost:9092";

export const kafka = new Kafka({
  brokers: [url],
  logLevel: logLevel.ERROR,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "chats" });

export const connectKafkaProducer = async () => {
  await producer.connect();
  console.log("Kafka Producer connected...");
};

export const connectKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC! });
  console.log("Kafka Consumer connected...");
};
