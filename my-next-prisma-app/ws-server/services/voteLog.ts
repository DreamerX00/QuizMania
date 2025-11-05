import { redisClient } from '../config/redis';

const VOTE_LOG_TTL_SECONDS = parseInt(process.env.VOTE_LOG_TTL || '86400', 10); // 24h

export async function createVoteLog(userId: string, roomId: string, type: string) {
  try {
    const key = `vote:log:${roomId}`;
    const entry = JSON.stringify({ userId, roomId, type, ts: Date.now() });
    await redisClient.rPush(key, entry);
    await redisClient.expire(key, VOTE_LOG_TTL_SECONDS);
  } catch {
    // non-fatal
  }
}
