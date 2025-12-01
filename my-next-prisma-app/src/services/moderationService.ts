import prisma from "../lib/prisma";
import { getRedisClient } from "../lib/redis";

const MUTE_PREFIX = "mute:"; // mute:{roomId}:{userId}
const BLOCK_PREFIX = "block:"; // block:{userId}:{blockedId}
const MUTE_TTL = 60 * 60; // 1 hour

export async function muteUser(
  roomId: string,
  userId: string,
  byId: string,
  reason?: string
) {
  const redis = getRedisClient();
  if (redis) {
    await redis.set(`${MUTE_PREFIX}${roomId}:${userId}`, "1", "EX", MUTE_TTL);
  }
  await logModerationAction("mute", userId, byId, reason, { roomId });
}
export async function unmuteUser(
  roomId: string,
  userId: string,
  byId: string,
  reason?: string
) {
  const redis = getRedisClient();
  if (redis) {
    await redis.del(`${MUTE_PREFIX}${roomId}:${userId}`);
  }
  await logModerationAction("unmute", userId, byId, reason, { roomId });
}
export async function isMuted(roomId: string, userId: string) {
  const redis = getRedisClient();
  if (!redis) return false;
  return !!(await redis.get(`${MUTE_PREFIX}${roomId}:${userId}`));
}
export async function blockUser(
  userId: string,
  blockedId: string,
  byId: string,
  reason?: string
) {
  const redis = getRedisClient();
  if (redis) {
    await redis.set(`${BLOCK_PREFIX}${userId}:${blockedId}`, "1");
  }
  await logModerationAction("block", blockedId, byId, reason);
}
export async function unblockUser(
  userId: string,
  blockedId: string,
  byId: string,
  reason?: string
) {
  const redis = getRedisClient();
  if (redis) {
    await redis.del(`${BLOCK_PREFIX}${userId}:${blockedId}`);
  }
  await logModerationAction("unblock", blockedId, byId, reason);
}
export async function isBlocked(userId: string, blockedId: string) {
  const redis = getRedisClient();
  if (!redis) return false;
  return !!(await redis.get(`${BLOCK_PREFIX}${userId}:${blockedId}`));
}
export async function reportUser(
  targetId: string,
  byId: string,
  reason?: string,
  context?: unknown
) {
  await logModerationAction("report", targetId, byId, reason, context);
}
export async function logModerationAction(
  action: string,
  targetUserId: string,
  performedById: string,
  reason?: string,
  context?: unknown
) {
  return prisma.moderationAction.create({
    data: {
      action,
      type: action.toUpperCase(),
      targetUserId,
      performedById,
      moderatorId: performedById,
      reason,
      context: context as never,
    },
  });
}
