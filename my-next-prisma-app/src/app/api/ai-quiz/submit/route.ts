import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getRankByXP } from "@/utils/rank";

// Force dynamic for real-time data
export const dynamic = "force-dynamic";

// Validation schema
const SubmitQuizSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  userId: z.string().min(1, "User ID is required"),
  answers: z.record(z.string(), z.string()),
  attemptId: z.string().optional().nullable(),
  timeSpent: z.number().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = SubmitQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { quizId, userId, answers, attemptId, timeSpent } = validation.data;

    // Verify user owns this submission
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch quiz with questions
    const quiz = await prisma.aIGeneratedQuiz.findUnique({
      where: { id: quizId },
      include: {
        provider: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Parse questions to validate answers
    const questions = quiz.questions as Array<{
      id: string;
      text?: string;
      question?: string; // Some AI responses use 'question' instead of 'text'
      options: Array<{
        id: string;
        text: string;
      }>;
      correctAnswer: string; // "a", "b", "c", or "d"
      explanation?: string;
      difficulty?: string;
      topic?: string;
    }>;

    // Calculate score and correctness
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    const questionResults: Record<
      string,
      {
        questionId: string;
        selectedAnswer: string | null;
        correctAnswer: string;
        isCorrect: boolean;
        wasSkipped: boolean;
      }
    > = {};

    questions.forEach((question) => {
      const selectedAnswerId = answers[question.id];
      // correctAnswer is "a", "b", "c", or "d" from the AI-generated question
      const correctAnswerId = question.correctAnswer.toLowerCase();

      if (!selectedAnswerId) {
        // Question was skipped
        skippedCount++;
        currentStreak = 0;
        questionResults[question.id] = {
          questionId: question.id,
          selectedAnswer: null,
          correctAnswer: correctAnswerId,
          isCorrect: false,
          wasSkipped: true,
        };
      } else {
        const isCorrect = selectedAnswerId.toLowerCase() === correctAnswerId;
        if (isCorrect) {
          correctCount++;
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          incorrectCount++;
          currentStreak = 0;
        }

        questionResults[question.id] = {
          questionId: question.id,
          selectedAnswer: selectedAnswerId,
          correctAnswer: correctAnswerId,
          isCorrect,
          wasSkipped: false,
        };
      }
    });

    const totalQuestions = questions.length;
    const answeredQuestions = correctCount + incorrectCount;
    const accuracy =
      answeredQuestions > 0 ? correctCount / answeredQuestions : 0;
    const score =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Calculate XP with bonuses
    const baseXP = quiz.baseXP;
    let totalXP = baseXP;
    const xpBreakdown: Record<string, number> = {
      base: baseXP,
    };

    // 1. Perfect Score Bonus (100% correct) - 50% bonus
    if (correctCount === totalQuestions && skippedCount === 0) {
      const perfectBonus = Math.round(baseXP * 0.5);
      totalXP += perfectBonus;
      xpBreakdown.perfectScore = perfectBonus;
    }

    // 2. High Accuracy Bonus (90%+) - 30% bonus
    else if (accuracy >= 0.9) {
      const accuracyBonus = Math.round(baseXP * 0.3);
      totalXP += accuracyBonus;
      xpBreakdown.highAccuracy = accuracyBonus;
    }

    // 3. Good Accuracy Bonus (75%+) - 15% bonus
    else if (accuracy >= 0.75) {
      const goodAccuracyBonus = Math.round(baseXP * 0.15);
      totalXP += goodAccuracyBonus;
      xpBreakdown.goodAccuracy = goodAccuracyBonus;
    }

    // 4. Speed Bonus (if completed in less than 50% of time limit)
    if (quiz.timeLimit && timeSpent) {
      const timePercentage = timeSpent / quiz.timeLimit;
      if (timePercentage <= 0.5) {
        const speedBonus = Math.round(baseXP * 0.25);
        totalXP += speedBonus;
        xpBreakdown.speedBonus = speedBonus;
      } else if (timePercentage <= 0.75) {
        const speedBonus = Math.round(baseXP * 0.1);
        totalXP += speedBonus;
        xpBreakdown.speedBonus = speedBonus;
      }
    }

    // 5. Streak Bonus (max streak of 5+ correct answers)
    if (maxStreak >= 10) {
      const streakBonus = Math.round(baseXP * 0.3);
      totalXP += streakBonus;
      xpBreakdown.streakBonus = streakBonus;
    } else if (maxStreak >= 5) {
      const streakBonus = Math.round(baseXP * 0.15);
      totalXP += streakBonus;
      xpBreakdown.streakBonus = streakBonus;
    }

    // 6. No Mistakes Bonus (0 incorrect, skipped allowed)
    if (incorrectCount === 0 && correctCount > 0) {
      const noMistakesBonus = Math.round(baseXP * 0.2);
      totalXP += noMistakesBonus;
      xpBreakdown.noMistakes = noMistakesBonus;
    }

    // 7. Completion Bonus (answered all questions)
    if (skippedCount === 0) {
      const completionBonus = Math.round(baseXP * 0.1);
      totalXP += completionBonus;
      xpBreakdown.completion = completionBonus;
    }

    // Apply difficulty multiplier
    if (quiz.bonusXPMultiplier && quiz.bonusXPMultiplier > 1) {
      const multiplierBonus = Math.round(
        totalXP * (quiz.bonusXPMultiplier - 1)
      );
      totalXP += multiplierBonus;
      xpBreakdown.difficultyMultiplier = multiplierBonus;
    }

    // Determine grade
    let grade = "F";
    if (score >= 95) grade = "S";
    else if (score >= 90) grade = "A+";
    else if (score >= 85) grade = "A";
    else if (score >= 80) grade = "B+";
    else if (score >= 75) grade = "B";
    else if (score >= 70) grade = "C+";
    else if (score >= 65) grade = "C";
    else if (score >= 60) grade = "D";

    // Create or update attempt record
    const attemptData = {
      quizId,
      userId,
      answers: answers,
      status: "completed",
      totalQuestions,
      correctCount,
      wrongCount: incorrectCount,
      skippedCount,
      score: Math.round(score),
      percentage: accuracy,
      accuracy,
      streak: maxStreak,
      xpEarned: totalXP,
      baseXP: quiz.baseXP,
      accuracyBonus:
        xpBreakdown.highAccuracy ||
        xpBreakdown.goodAccuracy ||
        xpBreakdown.perfectScore ||
        0,
      speedBonus: xpBreakdown.speedBonus || 0,
      streakBonus: xpBreakdown.streakBonus || 0,
      perfectBonus: xpBreakdown.perfectScore || 0,
      totalTimeSpent: timeSpent || 0,
      averageTimePerQ: timeSpent ? Math.round(timeSpent / totalQuestions) : 0,
      completedAt: new Date(),
    };

    let attempt;
    if (attemptId) {
      // Update existing attempt
      attempt = await prisma.aIQuizAttempt.update({
        where: { id: attemptId },
        data: attemptData,
      });
    } else {
      // Get the next attempt number for this user+quiz
      const lastAttempt = await prisma.aIQuizAttempt.findFirst({
        where: { quizId, userId },
        orderBy: { attemptNumber: "desc" },
        select: { attemptNumber: true },
      });

      // Create new attempt
      attempt = await prisma.aIQuizAttempt.create({
        data: {
          ...attemptData,
          attemptNumber: (lastAttempt?.attemptNumber || 0) + 1,
          startedAt: new Date(),
        },
      });
    }

    // Update quiz statistics
    await prisma.aIGeneratedQuiz.update({
      where: { id: quizId },
      data: {
        attemptCount: { increment: 1 },
        averageScore: {
          set:
            quiz.attemptCount > 0
              ? (quiz.averageScore * quiz.attemptCount + score) /
                (quiz.attemptCount + 1)
              : score,
        },
        completionRate: {
          set:
            quiz.attemptCount > 0
              ? (quiz.completionRate * quiz.attemptCount +
                  (skippedCount === 0 ? 100 : 0)) /
                (quiz.attemptCount + 1)
              : skippedCount === 0
              ? 100
              : 0,
        },
      },
    });

    // Get user's current XP to calculate rank change
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, rank: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldXp = currentUser.xp;
    const newXp = oldXp + totalXP;
    const oldRank = getRankByXP(oldXp).tierIndex;
    const newRank = getRankByXP(newXp).tierIndex;

    // Update user XP, rank, and streak
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { set: newXp },
        rank: { set: newRank },
        streak: { set: maxStreak }, // Update streak with the max streak from this quiz
      },
    });

    // Create RankHistory entry if rank changed
    if (oldRank !== newRank) {
      await prisma.rankHistory.create({
        data: {
          userId,
          oldRank,
          newRank,
          oldXp,
          newXp,
        },
      });
    }

    // Update AI Quiz Generation Quota statistics
    const currentQuota = await prisma.aIQuizGenerationQuota.findUnique({
      where: { userId },
      select: { longestStreak: true },
    });

    await prisma.aIQuizGenerationQuota.update({
      where: { userId },
      data: {
        totalAttempts: { increment: 1 },
        totalXPEarned: { increment: totalXP },
        currentStreak: { set: maxStreak },
        longestStreak: {
          set: Math.max(currentQuota?.longestStreak || 0, maxStreak),
        },
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      accuracy,
      grade,
      correctCount,
      incorrectCount,
      skippedCount,
      totalQuestions,
      totalXP,
      xpBreakdown,
      maxStreak,
      rankChanged: oldRank !== newRank,
      oldRank,
      newRank,
      newXp,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
