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
import { containsProfanity, cleanMessage } from "../services/profanityFilter";
import { logger } from "../config/logger";
import { prisma } from "../services/prisma";

// Redis-based mute/block state for multi-instance support
async function isMutedOrBlocked(
  socket: Socket,
  roomId: string
): Promise<boolean> {
  const userId = (socket as any).user?.id;
  if (!userId) return false;

  try {
    // Check if user is muted in the room
    const muteKey = `mute:${roomId}:${userId}`;
    const isMuted = await redisClient.exists(muteKey);
    if (isMuted) return true;

    // Check if user is blocked globally
    // Get all users who might have blocked this user
    const blockPattern = `block:*:${userId}`;
    const blockKeys = await redisClient.keys(blockPattern);
    if (blockKeys && blockKeys.length > 0) return true;

    return false;
  } catch (error) {
    console.error("Error checking mute/block status:", error);
    // Graceful degradation: allow message if Redis fails
    return false;
  }
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

    // Clean message if it contains profanity (auto-censor instead of block)
    let cleanedMessage = message;
    if (containsProfanity(message)) {
      cleanedMessage = cleanMessage(message);
      logger.info("Profanity detected and cleaned", {
        userId: (socket as any).user?.id,
        original: message.substring(0, 50),
        cleaned: cleanedMessage.substring(0, 50),
      });
    }

    if (await isMutedOrBlocked(socket, roomId || clanId || ""))
      return cb?.({ error: "User is muted or blocked" });
    const chatMsg = {
      user: (socket as any).user,
      message: cleanedMessage,
      timestamp: Date.now(),
      type,
    };
    // Persist to Postgres for persistent chat types
    if (type === "clan" && clanId) {
      await createClanChat(clanId, (socket as any).user.id, cleanedMessage);
    } else if (type === "room" && roomId) {
      await createRoomChat(roomId, (socket as any).user.id, cleanedMessage);
    } else if (type === "public") {
      await createPublicChat((socket as any).user.id, cleanedMessage);
    } else if (type === "friend" && receiverId) {
      await createFriendChat(
        (socket as any).user.id,
        receiverId,
        cleanedMessage
      );
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

  // Moderation events with Redis persistence
  socket.on("chat:mute", async ({ userId, roomId, duration = 3600 }, cb) => {
    try {
      const moderatorId = (socket as any).user?.id;
      if (!moderatorId) {
        return cb?.({ error: "Not authenticated", code: "UNAUTHORIZED" });
      }

      // Store mute in Redis with expiry (default 1 hour)
      const muteKey = `mute:${roomId}:${userId}`;
      if (redisClient && redisClient.isOpen) {
        await redisClient.setex?.(muteKey, duration, moderatorId);
      }

      // Also store in database for audit trail
      await prisma.moderationAction.create({
        data: {
          targetUserId: userId,
          performedById: moderatorId,
          moderatorId: moderatorId,
          action: "MUTE",
          type: "CHAT_MUTE",
          reason: `Muted in room ${roomId}`,
          roomId,
        },
      });

      // Notify room about mute
      io.to(roomId).emit("moderation:user-muted", { userId, duration });

      cb?.({ success: true, expiresAt: Date.now() + duration * 1000 });
    } catch (error) {
      console.error("Error muting user:", error);
      cb?.({ error: "Failed to mute user", code: "SERVER_ERROR" });
    }
  });

  socket.on("chat:unmute", async ({ userId, roomId }, cb) => {
    try {
      const moderatorId = (socket as any).user?.id;
      if (!moderatorId) {
        return cb?.({ error: "Not authenticated", code: "UNAUTHORIZED" });
      }

      // Remove mute from Redis
      const muteKey = `mute:${roomId}:${userId}`;
      await redisClient.del(muteKey);

      // Notify room about unmute
      io.to(roomId).emit("moderation:user-unmuted", { userId });

      cb?.({ success: true });
    } catch (error) {
      console.error("Error unmuting user:", error);
      cb?.({ error: "Failed to unmute user", code: "SERVER_ERROR" });
    }
  });

  socket.on("chat:block", async ({ userId }, cb) => {
    try {
      const blockerId = (socket as any).user?.id;
      if (!blockerId) {
        return cb?.({ error: "Not authenticated", code: "UNAUTHORIZED" });
      }

      // Store block in Redis (no expiry for blocks)
      const blockKey = `block:${blockerId}:${userId}`;
      await redisClient.set(blockKey, Date.now().toString());

      // Also store in database
      await prisma.userBlock.upsert({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId: userId,
          },
        },
        create: {
          blockerId,
          blockedId: userId,
        },
        update: {},
      });

      cb?.({ success: true });
    } catch (error) {
      console.error("Error blocking user:", error);
      cb?.({ error: "Failed to block user", code: "SERVER_ERROR" });
    }
  });

  socket.on("chat:unblock", async ({ userId }, cb) => {
    try {
      const blockerId = (socket as any).user?.id;
      if (!blockerId) {
        return cb?.({ error: "Not authenticated", code: "UNAUTHORIZED" });
      }

      // Remove block from Redis
      const blockKey = `block:${blockerId}:${userId}`;
      await redisClient.del(blockKey);

      // Remove from database
      await prisma.userBlock.deleteMany({
        where: {
          blockerId,
          blockedId: userId,
        },
      });

      cb?.({ success: true });
    } catch (error) {
      console.error("Error unblocking user:", error);
      cb?.({ error: "Failed to unblock user", code: "SERVER_ERROR" });
    }
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
      const report = await prisma.chatReport.create({
        data: {
          reporterId,
          reportedUserId: userId,
          message,
          roomId,
          reason,
          status: "PENDING",
        },
      });

      console.log("Chat report created:", report.id);

      // Notify moderators (emit to mod channel)
      io.to("moderators").emit("moderation:new-report", {
        reportId: report.id,
        reporterId,
        reportedUserId: userId,
        reason,
        roomId,
        timestamp: report.createdAt,
      });

      cb?.({ success: true, reportId: report.id });
    } catch (error) {
      console.error("Error creating report:", error);
      cb?.({ error: "Failed to create report", code: "SERVER_ERROR" });
    }
  });
}
