import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    switch (action) {
      case 'test_points':
        // Test points calculation
        const testResult = await QuizAttemptService.submitAttempt(
          userId,
          'test-quiz-id', // This would be a real quiz ID
          80, // 80% score
          100, // Total marks
          300, // 5 minutes
          'COMPLETED'
        );
        
        return NextResponse.json({
          success: true,
          message: 'Test points calculation completed',
          result: testResult
        });

      case 'get_user_points':
        // Get user's current points
        const userPoints = await QuizAttemptService.getUserPoints(userId);
        
        return NextResponse.json({
          success: true,
          userPoints
        });

      case 'get_leaderboard':
        // Get leaderboard
        const leaderboard = await QuizAttemptService.getLeaderboard(10);
        
        return NextResponse.json({
          success: true,
          leaderboard
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Test points error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 