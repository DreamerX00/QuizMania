// Quota Management for AI Quiz Generation

import { prisma } from "@/lib/prisma";
import { DAILY_QUOTA_LIMITS } from "@/constants/ai-quiz";
import { QuotaStatus } from "@/types/ai-quiz";
import { AccountType } from "@prisma/client";

export async function checkQuota(userId: string): Promise<QuotaStatus> {
  // Get or create quota record
  let quota = await prisma.aIQuizGenerationQuota.findUnique({
    where: { userId },
    include: {
      user: {
        select: { accountType: true },
      },
    },
  });

  // Create if doesn't exist
  if (!quota) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accountType: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    quota = await prisma.aIQuizGenerationQuota.create({
      data: {
        userId,
        dailyLimit: getDailyLimit(user.accountType),
        dailyUsed: 0,
        lastResetDate: new Date(),
      },
      include: {
        user: {
          select: { accountType: true },
        },
      },
    });
  }

  // Check if needs reset (new day)
  const now = new Date();
  const lastReset = new Date(quota.lastResetDate);
  const isNewDay = now.toDateString() !== lastReset.toDateString();

  if (isNewDay) {
    quota = await prisma.aIQuizGenerationQuota.update({
      where: { userId },
      data: {
        dailyUsed: 0,
        lastResetDate: now,
      },
      include: {
        user: {
          select: { accountType: true },
        },
      },
    });
  }

  // Update daily limit based on current account type
  const currentLimit = getDailyLimit(quota.user.accountType);
  if (quota.dailyLimit !== currentLimit) {
    quota = await prisma.aIQuizGenerationQuota.update({
      where: { userId },
      data: { dailyLimit: currentLimit },
      include: {
        user: {
          select: { accountType: true },
        },
      },
    });
  }

  const remaining = Math.max(0, currentLimit - quota.dailyUsed);
  const hasQuota = remaining > 0;

  // Reset time is midnight UTC of next day
  const resetAt = new Date(now);
  resetAt.setUTCHours(24, 0, 0, 0);

  return {
    hasQuota,
    remaining,
    total: currentLimit,
    resetAt,
    usage: {
      today: quota.dailyUsed,
      total: quota.totalGenerated,
    },
  };
}

export async function consumeQuota(userId: string): Promise<boolean> {
  // Use transaction to prevent race condition
  try {
    const result = await prisma.$transaction(async (tx) => {
      const quota = await tx.aIQuizGenerationQuota.findUnique({
        where: { userId },
        include: {
          user: {
            select: { accountType: true },
          },
        },
      });

      if (!quota) {
        throw new Error("Quota record not found");
      }

      const currentLimit = getDailyLimit(quota.user.accountType);
      const remaining = currentLimit - quota.dailyUsed;

      if (remaining <= 0) {
        return false;
      }

      await tx.aIQuizGenerationQuota.update({
        where: { userId },
        data: {
          dailyUsed: { increment: 1 },
          totalGenerated: { increment: 1 },
        },
      });

      return true;
    });

    return result;
  } catch (error) {
    console.error("Error consuming quota:", error);
    return false;
  }
}

export async function refundQuota(userId: string): Promise<void> {
  const quota = await prisma.aIQuizGenerationQuota.findUnique({
    where: { userId },
  });

  if (!quota || quota.dailyUsed <= 0) {
    return;
  }

  await prisma.aIQuizGenerationQuota.update({
    where: { userId },
    data: {
      dailyUsed: { decrement: 1 },
      totalGenerated: { decrement: 1 },
    },
  });
}

export function getDailyLimit(accountType: AccountType): number {
  return DAILY_QUOTA_LIMITS[accountType] || DAILY_QUOTA_LIMITS.FREE;
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountType: true },
  });

  if (!user) {
    return false;
  }

  return ["PREMIUM", "PREMIUM_PLUS", "LIFETIME"].includes(user.accountType);
}

export function formatResetTime(resetAt: Date): string {
  const now = new Date();
  const diff = resetAt.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
