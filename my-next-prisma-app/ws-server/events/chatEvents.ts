import { Server, Socket } from 'socket.io';
import { redisClient } from '../config/redis';

// Placeholder: Replace with a real word list or external service
const PROFANITY_WORDS = ['badword', 'anotherbadword'];
function profanityFilter(msg: string): boolean {
  return PROFANITY_WORDS.some(word => msg.toLowerCase().includes(word));
}

// In-memory mute/block (for demo only; use Redis/DB in production)
const mutedUsers: Record<string, Set<string>> = {}; // roomId -> Set<userId>
const blockedUsers: Record<string, Set<string>> = {}; // userId -> Set<blockedUserId>

function isMutedOrBlocked(socket: Socket, roomId: string): boolean {
  const userId = (socket as any).user?.id;
  if (!userId) return false;
  if (mutedUsers[roomId]?.has(userId)) return true;
  // Check if this user is blocked by anyone in the room (simplified)
  for (const blockedBy of Object.keys(blockedUsers)) {
    if (blockedUsers[blockedBy]?.has(userId)) return true;
  }
  return false;
}

export function registerChatEvents(io: Server, socket: Socket) {
  socket.on('chat:send', async ({ roomId, message, type }: { roomId: string; message: string; type: 'match' | 'clan' }, cb) => {
    try {
      if (!message || message.length > 1000) return cb?.({ error: 'Invalid message length' });
      if (profanityFilter(message)) return cb?.({ error: 'Message contains inappropriate language' });
      if (isMutedOrBlocked(socket, roomId)) return cb?.({ error: 'User is muted or blocked' });
      const chatMsg = {
        user: (socket as any).user,
        message,
        timestamp: Date.now(),
        type
      };
      if (type === 'match') {
        // Ephemeral: store in Redis (volatile)
        await redisClient.lPush(`chat:match:${roomId}`, JSON.stringify(chatMsg));
        await redisClient.expire(`chat:match:${roomId}`, 600); // 10 min
      }
      io.to(roomId).emit('chat:message', chatMsg);
      cb?.({ success: true });
    } catch (err) {
      cb?.({ error: 'Failed to send message' });
    }
  });

  // Moderation events
  socket.on('chat:mute', ({ userId, roomId }, cb) => {
    if (!mutedUsers[roomId]) mutedUsers[roomId] = new Set();
    mutedUsers[roomId].add(userId);
    cb?.({ success: true });
  });
  socket.on('chat:unmute', ({ userId, roomId }, cb) => {
    mutedUsers[roomId]?.delete(userId);
    cb?.({ success: true });
  });
  socket.on('chat:block', ({ userId }, cb) => {
    const blockerId = (socket as any).user?.id;
    if (!blockerId) return cb?.({ error: 'Not authenticated' });
    if (!blockedUsers[blockerId]) blockedUsers[blockerId] = new Set();
    blockedUsers[blockerId].add(userId);
    cb?.({ success: true });
  });
  socket.on('chat:unblock', ({ userId }, cb) => {
    const blockerId = (socket as any).user?.id;
    blockedUsers[blockerId]?.delete(userId);
    cb?.({ success: true });
  });
  socket.on('chat:report', ({ userId, message }, cb) => {
    // TODO: Implement report logic (store in DB, notify mods)
    cb?.({ success: true });
  });
}
// NOTE: For production, move mute/block state to Redis or DB for multi-instance support. 