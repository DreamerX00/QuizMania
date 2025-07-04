import { Socket } from 'socket.io';
import { redisClient } from '../config/redis';
// If ExtendedError is missing, define it locally:
type ExtendedError = Error & { data?: any };

const BUCKET_SIZE = 20; // max requests per window
const WINDOW = 1; // seconds

// Redis-based rate limiter: allows BUCKET_SIZE events per WINDOW per user
export async function rateLimiter(socket: Socket, next: (err?: ExtendedError) => void) {
  const userId = (socket as any).user?.id || socket.id;
  const key = `ratelimit:${userId}`;
  try {
    // Increment the count for this window
    const count = await redisClient.incr(key);
    if (count === 1) {
      // Set expiry for the window
      await redisClient.expire(key, WINDOW);
    }
    if (count > BUCKET_SIZE) {
      return next(new Error('Rate limit exceeded'));
    }
    next();
  } catch (err) {
    // If Redis fails, allow the request but log a warning
    console.warn('Rate limiter Redis error', err);
    next();
  }
}
// TODO: Upgrade to Redis-based rate limiter for production 