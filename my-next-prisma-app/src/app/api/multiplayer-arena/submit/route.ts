import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizRecordId, answers, duration, status } = await request.json();
    if (!quizRecordId || !Array.isArray(answers) || typeof duration !== 'number' || !status) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Submit the attempt with per-question answers
    const result = await QuizAttemptService.submitArenaAttempt(
      userId,
      quizRecordId,
      answers,
      duration,
      status
    );

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error submitting multiplayer arena attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit multiplayer arena attempt' },
      { status: 500 }
    );
  }
} 