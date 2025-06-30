import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';
import { updatePackageStatsForQuiz } from '@/services/updatePackageStats';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    const { score, totalMarks, duration, status = 'COMPLETED' } = await request.json();
    
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 400 });
    }

    if (typeof totalMarks !== 'number' || totalMarks <= 0) {
      return NextResponse.json({ error: 'Total marks must be a positive number' }, { status: 400 });
    }

    if (typeof duration !== 'number' || duration < 0) {
      return NextResponse.json({ error: 'Duration must be a positive number' }, { status: 400 });
    }

    // Use the new QuizAttemptService
    const result = await QuizAttemptService.submitAttempt(
      userId,
      quizId,
      score,
      totalMarks,
      duration,
      status
    );

    // Update package stats
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
    
    // Handle specific validation errors
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
}

// GET endpoint to check if user can attempt a quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Validate attempt
    const validation = await QuizAttemptService.validateAttempt(userId, quizId);
    
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating quiz attempt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 