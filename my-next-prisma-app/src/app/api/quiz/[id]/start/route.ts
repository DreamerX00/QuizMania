import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

    const quizId = params.id;
    const result = await QuizAttemptService.startAttempt(userId, quizId);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.reason,
          ...result
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz attempt' },
      { status: 500 }
    );
  }
} 