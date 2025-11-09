// ---
// chat:send event expected payload:
// {
//   type: 'match' | 'clan' | 'room' | 'public' | 'friend',
//   message: string,
//   roomId?: string,      // required for 'match' and 'room'
//   clanId?: string,      // required for 'clan'
//   receiverId?: string   // required for 'friend'
// }
// ---

import { Server, Socket } from "socket.io";
import { redisClient } from "../config/redis";
import {
  createClanChat,
  createRoomChat,
  createPublicChat,
  createFriendChat,
} from "../services/chatPersistence";
import { messagesTotal } from "../config/metrics";

// Placeholder: Replace with a real word list or external service
const PROFANITY_WORDS = ["badword", "anotherbadword"];
function profanityFilter(msg: string): boolean {
  return PROFANITY_WORDS.some((word) => msg.toLowerCase().includes(word));
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
  socket.on("chat:send", async (payload, cb) => {
    // Defensive: validate payload
    if (!payload || typeof payload !== "object")
      return cb?.({ error: "Invalid payload" });
    const { roomId, message, type, clanId, receiverId } = payload;
    if (
      !type ||
      !["match", "clan", "room", "public", "friend"].includes(type)
    ) {
      return cb?.({ error: "Invalid or missing chat type" });
    }
    if (!message || typeof message !== "string" || message.length > 1000) {
      return cb?.({ error: "Invalid message length" });
    }
    if (type === "clan" && !clanId)
      return cb?.({ error: "Missing clanId for clan chat" });
    if (type === "room" && !roomId)
      return cb?.({ error: "Missing roomId for room chat" });
    if (type === "friend" && !receiverId)
      return cb?.({ error: "Missing receiverId for friend chat" });
    if ((type === "match" || type === "room") && !roomId)
      return cb?.({ error: "Missing roomId" });
    if (profanityFilter(message))
      return cb?.({ error: "Message contains inappropriate language" });
    if (isMutedOrBlocked(socket, roomId || clanId || ""))
      return cb?.({ error: "User is muted or blocked" });
    const chatMsg = {
      user: (socket as any).user,
      message,
      timestamp: Date.now(),
      type,
    };
    // Persist to Postgres for persistent chat types
    if (type === "clan" && clanId) {
      await createClanChat(clanId, (socket as any).user.id, message);
    } else if (type === "room" && roomId) {
      await createRoomChat(roomId, (socket as any).user.id, message);
    } else if (type === "public") {
      await createPublicChat((socket as any).user.id, message);
    } else if (type === "friend" && receiverId) {
      await createFriendChat((socket as any).user.id, receiverId, message);
    }
    if (type === "match" && roomId) {
      // Ephemeral: store in Redis (volatile)
      await redisClient.lPush(`chat:match:${roomId}`, JSON.stringify(chatMsg));
      await redisClient.expire(`chat:match:${roomId}`, 600); // 10 min
    }
    io.to(roomId || clanId || receiverId || "public").emit(
      "chat:message",
      chatMsg
    );
    // Increment Prometheus metric
    messagesTotal.inc();
    cb?.({ success: true });
  });

  // Moderation events
  socket.on("chat:mute", ({ userId, roomId }, cb) => {
    if (!mutedUsers[roomId]) mutedUsers[roomId] = new Set();
    mutedUsers[roomId].add(userId);
    cb?.({ success: true });
  });
  socket.on("chat:unmute", ({ userId, roomId }, cb) => {
    mutedUsers[roomId]?.delete(userId);
    cb?.({ success: true });
  });
  socket.on("chat:block", ({ userId }, cb) => {
    const blockerId = (socket as any).user?.id;
    if (!blockerId) return cb?.({ error: "Not authenticated" });
    if (!blockedUsers[blockerId]) blockedUsers[blockerId] = new Set();
    blockedUsers[blockerId].add(userId);
    cb?.({ success: true });
  });
  socket.on("chat:unblock", ({ userId }, cb) => {
    const blockerId = (socket as any).user?.id;
    blockedUsers[blockerId]?.delete(userId);
    cb?.({ success: true });
  });
  socket.on("chat:report", async ({ userId, message, roomId, reason }, cb) => {
    const reporterId = (socket as any).user?.id;

    if (!reporterId) {
      return cb?.({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    if (!userId || !message || !reason) {
      return cb?.({ error: "Missing required fields", code: "INVALID_INPUT" });
    }

    try {
      // Store report in database
      // TODO: Replace with actual database call
      const report = {
        reporterId,
        reportedUserId: userId,
        message,
        roomId,
        reason,
        timestamp: Date.now(),
        status: "PENDING",
      };

      console.log("Chat report created:", report);

      // Notify moderators (emit to mod channel)
      io.to("moderators").emit("moderation:new-report", report);

      cb?.({ success: true, reportId: `report_${Date.now()}` });
    } catch (error) {
      console.error("Error creating report:", error);
      cb?.({ error: "Failed to create report", code: "SERVER_ERROR" });
    }
  });
}
// NOTE: For production, move mute/block state to Redis or DB for multi-instance support.
