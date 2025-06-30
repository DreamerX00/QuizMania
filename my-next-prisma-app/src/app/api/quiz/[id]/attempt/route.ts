import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { QuizAttemptService } from '@/services/quizAttemptService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizRecordId, score, totalMarks, duration, status } = await request.json();

    if (!quizRecordId || typeof score !== 'number' || typeof totalMarks !== 'number' || typeof duration !== 'number') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Submit the attempt
    const result = await QuizAttemptService.submitAttempt(
      userId,
      params.id,
      quizRecordId,
      score,
      totalMarks,
      duration,
      status
    );

    return NextResponse.json({
      success: true,
      earnedPoints: result.earnedPoints,
      isNewBestScore: result.isNewBestScore,
      previousBestScore: result.previousBestScore,
      totalAttempts: result.totalAttempts,
      averageScore: result.averageScore,
      quizUnlocked: result.quizUnlocked
    });

  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get attempt validation info
    const validation = await QuizAttemptService.validateAttempt(userId, params.id);
    
    // Get user's attempt history for this quiz
    const attemptHistory = await QuizAttemptService.getAttemptHistory(userId, params.id);
    
    // Get today's attempts
    const dailyAttempts = await QuizAttemptService.getDailyAttempts(userId, params.id);
    
    // Get quiz details
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        difficultyLevel: true,
        pricePerAttempt: true,
        pointPerAttempt: true,
        isPublished: true
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json({
      canAttempt: validation.canAttempt,
      reason: validation.reason,
      remainingAttempts: validation.remainingAttempts,
      dailyLimit: validation.dailyLimit,
      requiresPayment: validation.requiresPayment,
      isUnlocked: validation.isUnlocked,
      attemptHistory,
      dailyAttempts: dailyAttempts.length,
      quiz
    });

  } catch (error) {
    console.error('Error getting attempt info:', error);
    return NextResponse.json(
      { error: 'Failed to get attempt information' },
      { status: 500 }
    );
  }
} 