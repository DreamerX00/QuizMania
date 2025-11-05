import { redisClient } from '../config/redis';
import { logger } from '../config/logger';

const DEFAULT_WINDOW_MS = parseInt(process.env.VOTE_THROTTLE_WINDOW_MS || '2000', 10);

function key(userId: string, roomId: string) {
  return `vote:throttle:${roomId}:${userId}`;
}

/**
 * Returns true if the vote is allowed (not throttled), false otherwise.
 * Best-effort: if Redis is unavailable, returns true and logs a warning.
 */
export async function allowVote(userId: string, roomId: string, windowMs = DEFAULT_WINDOW_MS): Promise<boolean> {
  if (!userId || !roomId) return true;
  try {
    const k = key(userId, roomId);
    // Use SET with NX and PX for atomic rate-limit window.
    const res = await redisClient.set(k, '1', { NX: true, PX: windowMs });
    return res === 'OK';
  } catch (err) {
    logger.warn('Redis unavailable for vote throttle; allowing vote', { error: err instanceof Error ? err.message : err });
    return true;
  }
}
