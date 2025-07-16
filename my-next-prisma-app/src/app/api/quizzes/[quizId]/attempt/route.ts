import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';
import { updatePackageStatsForQuiz } from '@/services/updatePackageStats';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const attemptSchema = z.object({
  score: z.number().min(0).max(100),
  totalMarks: z.number().min(1),
  duration: z.number().min(0),
  status: z.string().optional(),
});

export const POST = withValidation(attemptSchema, async (request: any, { params }: { params: Promise<{ quizId: string }> }) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { quizId } = await params;
  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }
  const { score, totalMarks, duration, status = 'COMPLETED' } = request.validated;
  try {
    const result = await QuizAttemptService.submitAttempt(
      userId,
      quizId,
      score,
      totalMarks,
      duration,
      status
    );
    await updatePackageStatsForQuiz(quizId);
    return NextResponse.json({
      success: true,
      earnedPoints: result.earnedPoints,
      isNewBestScore: result.isNewBestScore,
      previousBestScore: result.previousBestScore,
      totalAttempts: result.totalAttempts,
      averageScore: result.averageScore
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    if (error instanceof Error) {
      if (error.message.includes('Premium subscription required')) {
        return NextResponse.json({
          error: 'Premium subscription required for this quiz',
          requiresPremium: true
        }, { status: 403 });
      }
      if (error.message.includes('Daily attempt limit reached')) {
        return NextResponse.json({
          error: error.message,
          limitReached: true
        }, { status: 429 });
      }
      if (error.message.includes('Cannot attempt quiz')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// GET endpoint to check if user can attempt a quiz
const quizIdParamSchema = z.object({ quizId: z.string().min(1) });
export const GET = withValidation(quizIdParamSchema, async (request: any, { params }: { params: Promise<{ quizId: string }> }) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { quizId } = await params;
  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }
  try {
    const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    const validation = await QuizAttemptService.validateAttempt(userId, quiz.id);
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating quiz attempt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}); 