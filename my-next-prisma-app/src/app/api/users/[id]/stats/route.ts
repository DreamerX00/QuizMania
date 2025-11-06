import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, context: any) {
  const { id: userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "50"))
    );
    const skip = (page - 1) * limit;

    // Get total count and paginated submissions
    const [submissions, totalCount] = await Promise.all([
      prisma.quizRecord.findMany({
        where: { userId },
        orderBy: { dateTaken: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          dateTaken: true,
          score: true,
          status: true,
          duration: true,
          quiz: {
            select: {
              title: true,
              id: true,
              tags: true,
              rating: true,
            },
          },
        },
      }),
      prisma.quizRecord.count({ where: { userId } }),
    ]);

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      select: {
        id: true,
        name: true,
        icon: true,
        isLocked: true,
        unlockedAt: true,
        type: true,
      },
    });

    if (totalCount === 0) {
      return NextResponse.json({
        stats: {
          quizzesTaken: 0,
          highestScore: 0,
          averageScore: 0,
          rank: null,
          favoriteSubject: null,
          performance: [],
        },
        recentQuizzes: [],
        achievements,
        pagination: {
          page: 1,
          limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    }

    const quizzesTaken = totalCount;
    const totalScore = submissions.reduce((acc, sub) => acc + sub.score, 0);
    const averageScore = Math.round(totalScore / submissions.length);
    const highestScore = Math.max(...submissions.map((sub) => sub.score));

    // Performance over time (last 10 quizzes from current page)
    const performance = submissions
      .slice(0, 10)
      .reverse()
      .map((sub, index) => ({
        name: `Quiz ${totalCount - skip - index}`,
        score: sub.score,
        title: sub.quiz.title,
      }));

    // Find rank (by average score)
    const allUserStats = await prisma.quizRecord.groupBy({
      by: ["userId"],
      _avg: { score: true },
      orderBy: { _avg: { score: "desc" } },
    });
    const rank =
      allUserStats.findIndex((stat: any) => stat.userId === userId) + 1;

    // Only include recentQuizzes where sub.quiz and sub.quiz.id are present
    const recentQuizzes = submissions
      .filter((sub) => sub.quiz && sub.quiz.id)
      .slice(0, 5)
      .map((sub) => ({
        attemptId: sub.id,
        quizId: sub.quiz.id,
        // slug: sub.quiz.slug, // Uncomment if slug is available in the schema
        title: sub.quiz.title,
        score: sub.score,
        date: sub.dateTaken,
      }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      stats: {
        quizzesTaken,
        highestScore,
        averageScore,
        rank: rank > 0 ? rank : null,
        favoriteSubject: null, // Not available
        performance,
      },
      recentQuizzes,
      achievements,
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
    console.error(`Error fetching stats for user ${userId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
