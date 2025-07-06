import { createClient } from 'redis';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({ url: REDIS_URL });
export const pubClient = createClient({ url: REDIS_URL });
export const subClient = createClient({ url: REDIS_URL });

(async () => {
  try {
    await redisClient.connect();
    await pubClient.connect();
    await subClient.connect();
    logger.info('Connected to Redis');
  } catch (err) {
    logger.error('Redis connection error - continuing without Redis', err);
    // Don't exit process for development - Redis is optional
    // process.exit(1);
  }
})(); 