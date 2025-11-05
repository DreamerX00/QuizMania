import { redisClient } from '../config/redis';

type ChatRecord = {
  userId: string;
  message: string;
  timestamp: number;
  type: 'clan' | 'room' | 'public' | 'friend';
  meta?: Record<string, any>;
};

const MAX_CHAT_HISTORY = parseInt(process.env.CHAT_HISTORY_LIMIT || '200', 10);

async function pushChat(key: string, rec: ChatRecord, ttlSeconds?: number) {
  try {
    await redisClient.lPush(key, JSON.stringify(rec));
    await redisClient.lTrim(key, 0, MAX_CHAT_HISTORY - 1);
    if (ttlSeconds && ttlSeconds > 0) {
      await redisClient.expire(key, ttlSeconds);
    }
  } catch {
    // Swallow errors in dev to avoid crashing chat on Redis outage
  }
}

export async function createClanChat(clanId: string, userId: string, message: string) {
  const rec: ChatRecord = { userId, message, timestamp: Date.now(), type: 'clan' };
  await pushChat(`chat:clan:${clanId}`, rec);
}

export async function createRoomChat(roomId: string, userId: string, message: string) {
  const rec: ChatRecord = { userId, message, timestamp: Date.now(), type: 'room' };
  await pushChat(`chat:room:${roomId}`, rec);
}

export async function createPublicChat(userId: string, message: string) {
  const rec: ChatRecord = { userId, message, timestamp: Date.now(), type: 'public' };
  await pushChat('chat:public', rec);
}

export async function createFriendChat(senderId: string, receiverId: string, message: string) {
  const pair = [senderId, receiverId].sort().join(':');
  const rec: ChatRecord = { userId: senderId, message, timestamp: Date.now(), type: 'friend', meta: { receiverId } };
  await pushChat(`chat:friend:${pair}`, rec);
}
