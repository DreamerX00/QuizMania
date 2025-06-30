import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        clerkId: true,
        name: true,
        accountType: true,
        premiumUntil: true,
        points: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get some quizzes to test with
    const quizzes = await prisma.quiz.findMany({
      where: {
        difficultyLevel: {
          in: ['EASY', 'MEDIUM', 'HARD', 'JEE_MAIN', 'NEET_UG']
        }
      },
      take: 5,
      select: {
        id: true,
        title: true,
        difficultyLevel: true,
        pricePerAttempt: true,
        pointPerAttempt: true
      }
    });

    // Get user's unlocked quizzes
    const unlockedQuizzes = await QuizAttemptService.getUnlockedQuizzes(userId);

    // Test validation for each quiz
    const validationResults = await Promise.all(
      quizzes.map(async (quiz) => {
        const validation = await QuizAttemptService.validateAttempt(userId, quiz.id);
        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          difficultyLevel: quiz.difficultyLevel,
          pricePerAttempt: quiz.pricePerAttempt,
          pointPerAttempt: quiz.pointPerAttempt,
          validation: {
            canAttempt: validation.canAttempt,
            reason: validation.reason,
            remainingAttempts: validation.remainingAttempts,
            dailyLimit: validation.dailyLimit,
            requiresPayment: validation.requiresPayment,
            isUnlocked: validation.isUnlocked
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        accountType: user.accountType,
        premiumUntil: user.premiumUntil,
        points: user.points,
        isPremium: user.accountType === 'PREMIUM' || user.accountType === 'LIFETIME' || (user.premiumUntil && new Date(user.premiumUntil) > new Date())
      },
      unlockedQuizzes: unlockedQuizzes.map(uq => ({
        quizId: uq.quizId,
        quizTitle: uq.quiz.title,
        unlockedAt: uq.unlockedAt
      })),
      totalUnlocked: unlockedQuizzes.length,
      validationResults
    });

  } catch (error) {
    console.error('Error testing unlock functionality:', error);
    return NextResponse.json(
      { error: 'Failed to test unlock functionality' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId, score, totalMarks, duration } = await request.json();

    if (!quizId || typeof score !== 'number' || typeof totalMarks !== 'number' || typeof duration !== 'number') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Submit a test attempt
    const result = await QuizAttemptService.submitAttempt(
      userId,
      quizId,
      score,
      totalMarks,
      duration,
      'COMPLETED'
    );

    // Get updated unlock status
    const isUnlocked = await QuizAttemptService.isQuizUnlocked(userId, quizId);

    return NextResponse.json({
      success: true,
      attemptResult: result,
      isUnlockedAfterAttempt: isUnlocked,
      quizUnlocked: result.quizUnlocked
    });

  } catch (error) {
    console.error('Error testing attempt submission:', error);
    return NextResponse.json(
      { error: 'Failed to test attempt submission' },
      { status: 500 }
    );
  }
} 