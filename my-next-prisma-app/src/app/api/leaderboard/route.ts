import { NextRequest, NextResponse } from 'next/server';
import { QuizAttemptService } from '@/services/quizAttemptService';

// If there is any authentication or authorization check, comment it out so all requests are allowed.
async function authenticate(request: Request) {
  // const authHeader = request.headers.get('authorization');
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return { error: 'No token provided', status: 401 };
  // }
  // const token = authHeader.substring(7);
  // const decoded = verifyToken(token);
  // if (!decoded || !decoded.userId) {
  //   return { error: 'Unauthorized', status: 401 };
  // }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Get leaderboard data
    const leaderboard = await QuizAttemptService.getLeaderboard(limit + offset);
    
    // Apply pagination
    const paginatedLeaderboard = leaderboard.slice(offset, offset + limit);

    // Add rank numbers
    const leaderboardWithRanks = paginatedLeaderboard.map((user, index) => ({
      rank: offset + index + 1,
      ...user,
      totalQuizzes: user._count.quizzes
    }));

    return NextResponse.json({
      leaderboard: leaderboardWithRanks,
      pagination: {
        page,
        limit,
        total: leaderboard.length,
        hasMore: leaderboard.length > offset + limit
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
