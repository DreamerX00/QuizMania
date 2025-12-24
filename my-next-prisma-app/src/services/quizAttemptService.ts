import prisma from "@/lib/prisma";
import {
  calculateEarnedPoints,
  getDailyAttemptLimit,
  canAccessPremiumQuiz,
  getPricingConfig,
} from "@/constants/pricing";
import { QuizStatus, Prisma } from "@/generated/prisma/client";
import { calculateArenaXP } from "./xpAlgorithm";
import { getRankByXP } from "@/utils/rank";

export interface AttemptValidationResult {
  canAttempt: boolean;
  reason?: string;
  remainingAttempts?: number;
  dailyLimit?: number;
  requiresPayment?: boolean;
  isUnlocked?: boolean;
}

export interface StartAttemptResult {
  success: boolean;
  reason?: string;
  quizRecordId?: string;
  remainingAttempts?: number;
  dailyLimit?: number;
  requiresPayment?: boolean;
  isUnlocked?: boolean;
}

export interface AttemptResult {
  success: boolean;
  earnedPoints: number;
  isNewBestScore: boolean;
  previousBestScore?: number;
  totalAttempts: number;
  averageScore: number;
  quizUnlocked?: boolean;
}

export class QuizAttemptService {
  /**
   * Check if a premium user has unlocked a quiz
   */
  static async isQuizUnlocked(
    userId: string,
    quizId: string
  ): Promise<boolean> {
    const unlock = await prisma.quizUnlock.findUnique({
      where: {
        quizId_userId: {
          quizId,
          userId,
        },
      },
    });
    return !!unlock;
  }

  /**
   * Unlock a quiz for a premium user
   */
  static async unlockQuiz(userId: string, quizId: string): Promise<void> {
    await prisma.quizUnlock.upsert({
      where: {
        quizId_userId: {
          quizId,
          userId,
        },
      },
      update: {},
      create: {
        userId,
        quizId,
        unlockedAt: new Date(),
      },
    });
  }

  /**
   * Validate if user can attempt a quiz
   */
  static async validateAttempt(
    userId: string,
    quizId: string,
    tx?: Prisma.TransactionClient
  ): Promise<AttemptValidationResult> {
    const db = tx ?? prisma;
    // Get user and quiz data
    const [user, quiz] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.quiz.findUnique({ where: { id: quizId } }),
    ]);

    if (!user || !quiz) {
      return { canAttempt: false, reason: "User or quiz not found" };
    }

    // Check if quiz requires premium access
    const isPremiumQuiz =
      quiz.difficultyLevel &&
      getPricingConfig(quiz.difficultyLevel).requiresPremium;
    const isPremiumUser = canAccessPremiumQuiz(
      user.accountType,
      user.premiumUntil
    );
    const isQuizUnlocked = await this.isQuizUnlocked(userId, quizId);

    if (isPremiumQuiz && !isPremiumUser) {
      return {
        canAttempt: false,
        reason: "Premium subscription required for this quiz",
      };
    }

    // Check daily attempt limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttempts = await db.attempt.count({
      where: {
        userId,
        quizId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const dailyLimit = getDailyAttemptLimit(user.accountType);
    const remainingAttempts = dailyLimit - todayAttempts;

    if (remainingAttempts <= 0) {
      return {
        canAttempt: false,
        reason: `Daily attempt limit reached (${dailyLimit} attempts)`,
        remainingAttempts: 0,
        dailyLimit,
      };
    }

    // Determine if payment is required
    let requiresPayment = false;

    if (quiz.difficultyLevel) {
      const pricingConfig = getPricingConfig(quiz.difficultyLevel);

      if (pricingConfig.pricePerAttempt === 0) {
        requiresPayment = false;
      } else if (isPremiumUser) {
        if (isQuizUnlocked) {
          requiresPayment = false;
        } else {
          requiresPayment = true;
        }
      } else {
        requiresPayment = true;
      }
    }

    return {
      canAttempt: true,
      remainingAttempts,
      dailyLimit,
      requiresPayment,
      isUnlocked: isQuizUnlocked,
    };
  }

  /**
   * Submit a quiz attempt and calculate points
   */
  static async submitAttempt(
    userId: string,
    quizId: string,
    quizRecordId: string,
    score: number,
    totalMarks: number,
    duration: number,
    status: QuizStatus = QuizStatus.COMPLETED
  ): Promise<AttemptResult> {
    const existingRecord = await prisma.quizRecord.findUnique({
      where: { id: quizRecordId },
    });

    if (
      !existingRecord ||
      existingRecord.userId !== userId ||
      existingRecord.status !== "IN_PROGRESS"
    ) {
      throw new Error("In-progress quiz record not found or access denied.");
    }

    // Get quiz data
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz || !quiz.difficultyLevel) {
      throw new Error("Quiz not found or no difficulty level set");
    }

    const isQuizUnlocked = await this.isQuizUnlocked(userId, quizId);
    const quizUnlocked = isQuizUnlocked;

    // Calculate earned points
    const pricingConfig = getPricingConfig(quiz.difficultyLevel);
    const earnedPoints = calculateEarnedPoints(
      score,
      totalMarks,
      pricingConfig.pointPerAttempt
    );

    // Check if this is the best score for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBestScore = await prisma.quizRecord.findFirst({
      where: {
        userId,
        quizId,
        dateTaken: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { score: "desc" },
    });

    const isNewBestScore = !todayBestScore || score > todayBestScore.score;

    // Update quiz record
    await prisma.quizRecord.update({
      where: { id: quizRecordId },
      data: {
        score,
        duration,
        dateTaken: new Date(),
        status,
        earnedPoints: isNewBestScore ? earnedPoints : 0, // Only award points for best score
      },
    });

    // Update user points only if this is the best score
    if (isNewBestScore && earnedPoints > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: earnedPoints } },
      });
    }

    // Update quiz stats
    const allRecords = await prisma.quizRecord.findMany({
      where: { quizId },
      select: { score: true },
    });

    const totalAttempts = allRecords.length;
    const averageScore =
      allRecords.length > 0
        ? allRecords.reduce((sum, r) => sum + r.score, 0) / allRecords.length
        : 0;

    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        usersTaken: totalAttempts,
        averageScore: Math.round(averageScore * 10) / 10,
      },
    });

    return {
      success: true,
      earnedPoints: isNewBestScore ? earnedPoints : 0,
      isNewBestScore,
      previousBestScore: todayBestScore?.score,
      totalAttempts,
      averageScore: Math.round(averageScore * 10) / 10,
      quizUnlocked,
    };
  }

  /**
   * Get user's unlocked quizzes
   */
  static async getUnlockedQuizzes(userId: string) {
    return await prisma.quizUnlock.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficultyLevel: true,
            pricePerAttempt: true,
            pointPerAttempt: true,
          },
        },
      },
      orderBy: { unlockedAt: "desc" },
    });
  }

  /**
   * Get user's attempt history for a quiz
   */
  static async getAttemptHistory(userId: string, quizId: string) {
    const attempts = await prisma.quizRecord.findMany({
      where: { userId, quizId },
      orderBy: { dateTaken: "desc" },
      include: {
        quiz: {
          select: {
            title: true,
            difficultyLevel: true,
            pointPerAttempt: true,
          },
        },
      },
    });

    return attempts;
  }

  /**
   * Get user's daily attempts for a quiz
   */
  static async getDailyAttempts(userId: string, quizId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.attempt.findMany({
      where: {
        userId,
        quizId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { date: "desc" },
    });
  }

  /**
   * Get user's total points and ranking
   */
  static async getUserPoints(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, accountType: true, premiumUntil: true },
    });

    if (!user) return null;

    // Get user's rank based on total points
    const rank = await prisma.user.count({
      where: { points: { gt: user.points } },
    });

    return {
      points: user.points,
      rank: rank + 1,
      accountType: user.accountType,
      premiumUntil: user.premiumUntil,
    };
  }

  /**
   * Get leaderboard based on total points
   */
  static async getLeaderboard(limit: number = 50) {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        accountType: true,
        _count: {
          select: { quizzes: true },
        },
      },
      orderBy: { points: "desc" },
      take: limit,
    });
  }

  /**
   * Resolve a quiz by cuid or slug
   */
  static async resolveQuizIdentifier(identifier: string) {
    try {
      const quiz = await prisma.quiz.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
      });
      if (!quiz) {
        throw new Error(`Quiz not found for identifier: ${identifier}`);
      }
      return quiz;
    } catch (error) {
      console.error(`Error resolving quiz identifier "${identifier}":`, error);
      throw new Error(`Quiz not found for identifier: ${identifier}`);
    }
  }

  static async startAttempt(
    userId: string,
    quizId: string,
    fingerprint?: string,
    deviceInfo?: Prisma.JsonValue,
    ip?: string
  ): Promise<StartAttemptResult & { sessionId?: string }> {
    // Use an interactive transaction to make the start atomic and avoid races
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch user and quiz inside transaction
      const [user, quiz] = await Promise.all([
        tx.user.findUnique({ where: { id: userId } }),
        tx.quiz.findUnique({ where: { id: quizId } }),
      ]);

      if (!user || !quiz) {
        return {
          success: false,
          reason: "User or quiz not found",
        } as StartAttemptResult & { sessionId?: string };
      }

      // Check for existing IN_PROGRESS record (atomic check)
      const existingAttempt = await tx.quizRecord.findFirst({
        where: { userId, quizId, status: "IN_PROGRESS" },
      });
      if (existingAttempt) {
        return {
          success: false,
          reason: "You already have an attempt in progress for this quiz.",
          quizRecordId: existingAttempt.id,
        } as StartAttemptResult & { sessionId?: string };
      }

      // Reuse validation logic inside the transaction to avoid duplication
      const validation = await this.validateAttempt(userId, quizId, tx);
      if (!validation.canAttempt) {
        return {
          success: false,
          reason: validation.reason,
          remainingAttempts: validation.remainingAttempts,
          dailyLimit: validation.dailyLimit,
          requiresPayment: validation.requiresPayment,
          isUnlocked: validation.isUnlocked,
        } as StartAttemptResult & { sessionId?: string };
      }

      const { remainingAttempts, dailyLimit } = validation;

      // Create attempt and quizRecord atomically
      await tx.attempt.create({ data: { userId, quizId, date: new Date() } });
      const quizRecord = await tx.quizRecord.create({
        data: {
          userId,
          quizId,
          score: 0,
          duration: 0,
          dateTaken: new Date(),
          status: "IN_PROGRESS",
          earnedPoints: 0,
        },
      });

      let sessionId: string | undefined = undefined;
      if (fingerprint && deviceInfo && ip) {
        const session = await tx.quizLinkSession.create({
          data: { userId, quizId, fingerprint, deviceInfo, ip },
        });
        sessionId = session.id;
      }

      return {
        success: true,
        quizRecordId: quizRecord.id,
        remainingAttempts:
          typeof remainingAttempts === "number"
            ? remainingAttempts - 1
            : undefined,
        dailyLimit,
        sessionId,
      } as StartAttemptResult & { sessionId?: string };
    });

    return result;
  }

  /**
   * Submit a multiplayer arena attempt with per-question answers and calculate XP
   */
  static async submitArenaAttempt(
    userId: string,
    quizRecordId: string,
    answers: Array<{
      questionId: string;
      type: string;
      isCorrect: boolean;
      timeTaken: number;
      answer: Prisma.InputJsonValue;
    }>,
    duration: number,
    status: QuizStatus = QuizStatus.COMPLETED
  ): Promise<AttemptResult> {
    const existingRecord = await prisma.quizRecord.findUnique({
      where: { id: quizRecordId },
    });
    if (
      !existingRecord ||
      existingRecord.userId !== userId ||
      existingRecord.status !== "IN_PROGRESS"
    ) {
      throw new Error("In-progress quiz record not found or access denied.");
    }

    // Store each answer in QuestionRecord
    await prisma.$transaction(
      answers.map((ans) =>
        prisma.questionRecord.create({
          data: {
            quizRecordId,
            questionId: ans.questionId,
            type: ans.type,
            isCorrect: ans.isCorrect,
            timeTaken: ans.timeTaken,
            answer: ans.answer,
          },
        })
      )
    );

    // Calculate XP using the new algorithm
    const earnedXP = calculateArenaXP(answers, { duration });

    // Get user's old XP and rank before update
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
    });
    const oldXp = userBefore?.xp || 0;
    const oldRank = getRankByXP(oldXp).tierIndex;

    // Update quiz record
    await prisma.quizRecord.update({
      where: { id: quizRecordId },
      data: {
        score: answers.filter((a) => a.isCorrect).length,
        duration,
        dateTaken: new Date(),
        status,
        earnedPoints: earnedXP,
      },
    });

    // Update user XP
    const userAfter = await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: earnedXP } },
      select: { xp: true },
    });
    const newXp = userAfter.xp;
    const newRank = getRankByXP(newXp).tierIndex;

    // If rank changed, record in RankHistory
    if (oldRank !== newRank) {
      await prisma.rankHistory.create({
        data: {
          userId,
          oldRank,
          newRank,
          oldXp,
          newXp,
          changedAt: new Date(),
        },
      });
    }

    // Return result
    return {
      success: true,
      earnedPoints: earnedXP,
      isNewBestScore: true, // For now, always true for arena
      previousBestScore: undefined,
      totalAttempts: 1, // For now, always 1 for arena
      averageScore: answers.filter((a) => a.isCorrect).length,
      quizUnlocked: true,
    };
  }

  static async submitStructuredAttempt({
    userId,
    quizId,
    submittedAt,
    responses,
    summary,
    violations,
  }: {
    userId: string;
    quizId: string;
    submittedAt: Date;
    responses: Array<{
      questionId: string;
      answer: Prisma.JsonValue;
      type: string;
      requiresManualReview: boolean;
    }>;
    summary: Prisma.JsonValue;
    violations?: Prisma.InputJsonValue;
  }) {
    // Find the in-progress QuizRecord
    const quizRecord = await prisma.quizRecord.findFirst({
      where: {
        userId,
        quizId,
        status: "IN_PROGRESS",
      },
    });
    if (!quizRecord) throw new Error("No in-progress quiz record found");

    if (!summary) throw new Error("Missing summary for structured attempt");
    const summaryObj = summary as unknown as {
      obtainedMarks?: number;
      durationInSeconds?: number;
    };

    // Update QuizRecord
    await prisma.quizRecord.update({
      where: { id: quizRecord.id },
      data: {
        responses: responses as Prisma.InputJsonValue,
        status: QuizStatus.COMPLETED,
        dateTaken: submittedAt ? new Date(submittedAt) : new Date(),
        isManualReviewPending: responses.some((r) => r.requiresManualReview),
        score: summaryObj.obtainedMarks || 0,
        duration: summaryObj.durationInSeconds || 0,
      },
    });

    // Persist any structured violations into QuizViolation table if present
    if (violations) {
      try {
        const v = violations as unknown;
        if (Array.isArray(v)) {
          const items = v as Array<{ type?: string; reason?: string }>;
          await prisma.$transaction(
            items.map((item) =>
              prisma.quizViolation.create({
                data: {
                  quizRecordId: quizRecord.id,
                  userId,
                  quizId,
                  type: item.type || "violation",
                  reason: item.reason || JSON.stringify(item),
                },
              })
            )
          );
        }
      } catch (err) {
        console.error("Failed to persist violations:", err);
      }
    }
    // Add manual review items
    const manualItems = responses.filter((r) => r.requiresManualReview);
    if (manualItems.length > 0) {
      await prisma.$transaction(
        manualItems.map((r) =>
          prisma.manualReviewQueue.create({
            data: {
              quizRecordId: quizRecord.id,
              questionId: r.questionId,
              userId,
              quizId,
              answer: r.answer as Prisma.InputJsonValue,
              type: r.type,
            },
          })
        )
      );
    }
    return {
      success: true,
      summary,
      manualReviewPending: manualItems.length > 0,
    };
  }
}
