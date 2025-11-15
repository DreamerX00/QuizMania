import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Fetch all question records for this user
    const records = await prisma.questionRecord.findMany({
      where: {
        quizRecord: { userId },
      },
    });
    if (!records.length) {
      return NextResponse.json({ analytics: null });
    }
    // Group by type
    const byType: Record<
      string,
      { total: number; correct: number; totalTime: number; xp: number }
    > = {};
    for (const r of records) {
      if (!byType[r.type])
        byType[r.type] = { total: 0, correct: 0, totalTime: 0, xp: 0 };

      const stats = byType[r.type];
      if (!stats) continue; // TypeScript guard

      stats.total++;
      if (r.isCorrect) stats.correct++;
      stats.totalTime += r.timeTaken;

      // XP per question type (use same as XP algo)
      switch (r.type) {
        case "mcq-single":
          stats.xp += r.isCorrect ? 5 : 0;
          break;
        case "mcq-multiple":
          stats.xp += r.isCorrect ? 10 : 0;
          break;
        case "true-false":
          stats.xp += r.isCorrect ? 3 : 0;
          break;
        case "match":
          stats.xp += r.isCorrect ? 12 : 0;
          break;
        case "matrix":
          stats.xp += r.isCorrect ? 15 : 0;
          break;
        case "poll":
          break;
        case "fill-blanks":
          stats.xp += r.isCorrect ? 8 : 0;
          break;
        case "drag-drop":
          stats.xp += r.isCorrect ? 10 : 0;
          break;
        case "image-based":
          stats.xp += r.isCorrect ? 12 : 0;
          break;
        case "ordering":
          stats.xp += r.isCorrect ? 10 : 0;
          break;
        default:
          break;
      }
    }
    // Calculate analytics
    const analytics = Object.entries(byType).map(([type, data]) => ({
      type,
      total: data.total,
      correct: data.correct,
      accuracy: data.total ? Math.round((data.correct / data.total) * 100) : 0,
      avgTime: data.total ? Math.round(data.totalTime / data.total) : 0,
      xp: data.xp,
    }));
    // Most missed type
    const mostMissed =
      analytics.length > 0
        ? analytics.reduce((max, a) => (a.accuracy < max.accuracy ? a : max))
        : null;
    return NextResponse.json({
      analytics,
      mostMissedType: mostMissed?.type || null,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
