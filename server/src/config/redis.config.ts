import Redis from "ioredis";

let redis: Redis;

if (process.env.NODE_ENV === "production") {
  redis = new Redis(process.env.REDIS_URL!);
} else {
  redis = new Redis({
    host: "localhost",
    port: 6379,
  });
}

/**
 * Creates and exports a singleton ioredis client.
 *
 * Uses `REDIS_URL` env var in production, otherwise defaults to
 * localhost:6379 for local development.
 */
export default redis;
