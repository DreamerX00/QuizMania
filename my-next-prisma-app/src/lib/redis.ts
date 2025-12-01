import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!redisClient) {
    try {
      redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
      });

      redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
        redisClient = null;
      });

      redisClient.on("connect", () => {
        console.log("Redis connected successfully");
      });

      // Connect asynchronously
      redisClient.connect().catch((err) => {
        console.error("Redis connection error - continuing without Redis", err);
        redisClient = null;
      });
    } catch (err) {
      console.error("Failed to create Redis client:", err);
      redisClient = null;
    }
  }

  return redisClient;
}
