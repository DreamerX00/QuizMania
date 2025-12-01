import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unlockedQuizzes = await QuizAttemptService.getUnlockedQuizzes(userId);

    return NextResponse.json({
      success: true,
      unlockedQuizzes,
      totalUnlocked: unlockedQuizzes.length,
    });
  } catch (error) {
    console.error("Error fetching unlocked quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch unlocked quizzes" },
      { status: 500 }
    );
  }
}
