import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRankByXP } from "@/utils/rank";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const records = await prisma.quizRecord.findMany({
      where: { userId },
      orderBy: { dateTaken: "desc" },
      include: { questionRecords: true },
    });
    const totalMatches = records.length;
    const totalXP = user.xp;
    const rankInfo = getRankByXP(totalXP);
    const bestScore = records.reduce(
      (max: number, r: (typeof records)[number]) => Math.max(max, r.score),
      0
    );
    const averageScore =
      records.length > 0
        ? Math.round(
            records.reduce(
              (sum: number, r: (typeof records)[number]) => sum + r.score,
              0
            ) / records.length
          )
        : 0;
    // Streak: count consecutive wins (COMPLETED with all correct)
    let streak = 0;
    for (const r of records) {
      if (
        r.status === "COMPLETED" &&
        r.questionRecords.every(
          (q: (typeof r.questionRecords)[number]) => q.isCorrect
        )
      ) {
        streak++;
      } else {
        break;
      }
    }
    // Recent performance (last 10 matches)
    const performance = records
      .slice(0, 10)
      .reverse()
      .map((r: (typeof records)[number], i: number) => ({
        name: `Match ${records.length - i}`,
        score: r.score,
        date: r.dateTaken,
      }));
    return NextResponse.json({
      totalMatches,
      totalXP,
      rank: rankInfo.current,
      bestScore,
      averageScore,
      streak,
      performance,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
