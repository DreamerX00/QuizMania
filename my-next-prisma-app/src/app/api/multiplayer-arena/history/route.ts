import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { getRankByXP } from "@/utils/rank";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );
    const skip = (page - 1) * limit;

    // Fetch recent multiplayer arena matches (QuizRecords) with pagination
    const [records, totalCount] = await Promise.all([
      prisma.quizRecord.findMany({
        where: { userId },
        orderBy: { dateTaken: "desc" },
        take: limit,
        skip,
        include: {
          questionRecords: true,
          quiz: { select: { title: true, id: true } },
        },
      }),
      prisma.quizRecord.count({ where: { userId } }),
    ]);

    // Fetch user XP for rank
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const xp = user?.xp || 0;
    const rankInfo = getRankByXP(xp);

    // Format response
    const history = records.map((r: (typeof records)[number]) => ({
      id: r.id,
      quizId: r.quizId,
      quizTitle: r.quiz?.title || "",
      dateTaken: r.dateTaken,
      score: r.score,
      duration: r.duration,
      earnedPoints: r.earnedPoints,
      status: r.status,
      totalQuestions: r.questionRecords.length,
      correct: r.questionRecords.filter(
        (q: (typeof r.questionRecords)[number]) => q.isCorrect
      ).length,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      history,
      xp,
      rank: rankInfo.current,
      nextRank: rankInfo.next,
      progressPercent: rankInfo.progressPercent,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching multiplayer arena history:", error);
    return NextResponse.json(
      { error: "Failed to fetch multiplayer arena history" },
      { status: 500 }
    );
  }
}
