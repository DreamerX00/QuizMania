import { NextRequest, NextResponse } from "next/server";
import { QuizAttemptService } from "@/services/quizAttemptService";

// Leaderboard can use short cache (1 minute)
export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate every minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    // Get leaderboard data
    const leaderboard = await QuizAttemptService.getLeaderboard(limit + offset);

    // Apply pagination
    const paginatedLeaderboard = leaderboard.slice(offset, offset + limit);

    // Add rank numbers
    const leaderboardWithRanks = paginatedLeaderboard.map(
      (user: (typeof paginatedLeaderboard)[number], index: number) => ({
        rank: offset + index + 1,
        ...user,
        totalQuizzes: user._count.quizzes,
      })
    );

    return NextResponse.json({
      leaderboard: leaderboardWithRanks,
      pagination: {
        page,
        limit,
        total: leaderboard.length,
        hasMore: leaderboard.length > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
