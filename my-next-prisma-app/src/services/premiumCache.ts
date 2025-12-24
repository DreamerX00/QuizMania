// ================================================================================
// REDIS PREMIUM CACHE SERVICE
// ================================================================================
// Uses Upstash Redis for caching premium status to reduce database queries
// ================================================================================

import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";

// Initialize Upstash Redis client
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redis && process.env.REDIS_URL) {
    try {
      // Parse Upstash Redis URL
      const url = new URL(process.env.REDIS_URL);
      redis = new Redis({
        url: `https://${url.hostname}`,
        token: url.password || "",
      });
    } catch (error) {
      console.error("Failed to initialize Redis:", error);
      return null;
    }
  }
  return redis;
}

export interface PremiumStatus {
  userId: string;
  isPremium: boolean;
  accountType: "FREE" | "PREMIUM" | "PREMIUM_PLUS" | "LIFETIME";
  premiumUntil?: Date | string | null;
  features: string[];
  lastUpdated: Date | string;
}

export interface PremiumCacheConfig {
  redisUrl: string;
  ttl: number; // seconds
  fallbackEnabled: boolean;
  webhookSecret?: string;
}

export interface PremiumFeatures {
  multiplayerLimit: number;
  matchTypes: string[];
  clanCreation: boolean;
  analyticsAccess: boolean;
  avatarCustomization: boolean;
  dailyRewards: boolean;
  prioritySupport: boolean;
  unlimitedQuizzes: boolean;
}

const CACHE_TTL = 3600; // 1 hour cache
const CACHE_PREFIX = "premium:";

// Feature maps for different account types
const ACCOUNT_FEATURES: Record<string, PremiumFeatures> = {
  FREE: {
    multiplayerLimit: 2,
    matchTypes: ["MCQ", "TrueFalse"],
    clanCreation: false,
    analyticsAccess: false,
    avatarCustomization: false,
    dailyRewards: false,
    prioritySupport: false,
    unlimitedQuizzes: false,
  },
  PREMIUM: {
    multiplayerLimit: 8,
    matchTypes: ["MCQ", "TrueFalse", "MatchPairs", "FillBlanks", "Ordering"],
    clanCreation: true,
    analyticsAccess: true,
    avatarCustomization: true,
    dailyRewards: true,
    prioritySupport: false,
    unlimitedQuizzes: false,
  },
  PREMIUM_PLUS: {
    multiplayerLimit: 16,
    matchTypes: [
      "MCQ",
      "TrueFalse",
      "MatchPairs",
      "FillBlanks",
      "Ordering",
      "Essay",
      "Coding",
    ],
    clanCreation: true,
    analyticsAccess: true,
    avatarCustomization: true,
    dailyRewards: true,
    prioritySupport: true,
    unlimitedQuizzes: true,
  },
  LIFETIME: {
    multiplayerLimit: 32,
    matchTypes: [
      "MCQ",
      "TrueFalse",
      "MatchPairs",
      "FillBlanks",
      "Ordering",
      "Essay",
      "Coding",
      "Voice",
    ],
    clanCreation: true,
    analyticsAccess: true,
    avatarCustomization: true,
    dailyRewards: true,
    prioritySupport: true,
    unlimitedQuizzes: true,
  },
};

/**
 * Initialize premium cache service
 */
export function initializePremiumCache(
  _config?: Partial<PremiumCacheConfig>
): Redis | null {
  return getRedis();
}

/**
 * Get Redis service instance
 */
export function getPremiumCacheService(): Redis | null {
  return getRedis();
}

/**
 * Get premium status for a user (with caching)
 */
export async function getPremiumStatus(
  userId: string
): Promise<PremiumStatus | null> {
  const redisClient = getRedis();
  const cacheKey = `${CACHE_PREFIX}${userId}`;

  // Try cache first
  if (redisClient) {
    try {
      const cached = await redisClient.get<PremiumStatus>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.error("Redis cache read error:", error);
    }
  }

  // Fetch from database
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        accountType: true,
        premiumUntil: true,
      },
    });

    if (!user) {
      return null;
    }

    const now = new Date();
    const isPremium =
      user.accountType !== "FREE" &&
      (user.accountType === "LIFETIME" ||
        (user.premiumUntil && new Date(user.premiumUntil) > now));

    const status: PremiumStatus = {
      userId: user.id,
      isPremium,
      accountType: isPremium
        ? (user.accountType as PremiumStatus["accountType"])
        : "FREE",
      premiumUntil: user.premiumUntil?.toISOString() || null,
      features: isPremium
        ? Object.keys(
            ACCOUNT_FEATURES[user.accountType] || ACCOUNT_FEATURES.FREE
          )
        : [],
      lastUpdated: now.toISOString(),
    };

    // Cache the result
    if (redisClient) {
      try {
        await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(status));
      } catch (error) {
        console.error("Redis cache write error:", error);
      }
    }

    return status;
  } catch (error) {
    console.error("Database error fetching premium status:", error);
    return null;
  }
}

/**
 * Check if a user has premium status
 */
export async function isPremium(userId: string): Promise<boolean> {
  const status = await getPremiumStatus(userId);
  return status?.isPremium ?? false;
}

/**
 * Get premium features for a user
 */
export async function getPremiumFeatures(
  userId: string
): Promise<PremiumFeatures> {
  const status = await getPremiumStatus(userId);
  const accountType = status?.accountType || "FREE";
  return ACCOUNT_FEATURES[accountType] || ACCOUNT_FEATURES.FREE;
}

/**
 * Handle premium webhook (e.g., from Razorpay)
 */
export async function handlePremiumWebhook(
  payload: Record<string, unknown>,
  _signature?: string
): Promise<boolean> {
  try {
    const userId = payload.userId as string;
    if (!userId) {
      return false;
    }

    // Invalidate cache when premium status changes
    await invalidatePremiumStatus(userId);
    return true;
  } catch (error) {
    console.error("Webhook handling error:", error);
    return false;
  }
}

/**
 * Invalidate cached premium status for a user
 */
export async function invalidatePremiumStatus(userId: string): Promise<void> {
  const redisClient = getRedis();
  if (redisClient) {
    try {
      await redisClient.del(`${CACHE_PREFIX}${userId}`);
    } catch (error) {
      console.error("Redis cache invalidation error:", error);
    }
  }
}

/**
 * Batch invalidate multiple users
 */
export async function batchInvalidatePremiumStatus(
  userIds: string[]
): Promise<void> {
  const redisClient = getRedis();
  if (redisClient && userIds.length > 0) {
    try {
      const keys = userIds.map((id) => `${CACHE_PREFIX}${id}`);
      await redisClient.del(...keys);
    } catch (error) {
      console.error("Redis batch invalidation error:", error);
    }
  }
}

/**
 * Check if user has a specific premium feature
 */
export async function hasFeature(
  userId: string,
  feature: keyof PremiumFeatures
): Promise<boolean> {
  const features = await getPremiumFeatures(userId);
  const value = features[feature];

  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return false;
}
