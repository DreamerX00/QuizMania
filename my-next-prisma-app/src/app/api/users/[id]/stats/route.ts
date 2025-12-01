import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache for user stats

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    // Get regular quiz submissions and AI quiz attempts
    const [submissions, aiAttempts, totalRegularCount, totalAICount] =
      await Promise.all([
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
        prisma.aIQuizAttempt.findMany({
          where: { userId, status: "completed" },
          orderBy: { completedAt: "desc" },
          take: limit,
          skip,
          select: {
            id: true,
            completedAt: true,
            score: true,
            status: true,
            totalTimeSpent: true,
            quiz: {
              select: {
                title: true,
                id: true,
                slug: true,
                topics: true,
              },
            },
          },
        }),
        prisma.quizRecord.count({ where: { userId } }),
        prisma.aIQuizAttempt.count({
          where: { userId, status: "completed" },
        }),
      ]);

    // Combine and sort by date
    const allAttempts = [
      ...submissions.map((sub) => ({
        id: sub.id,
        date: sub.dateTaken,
        score: sub.score,
        status: sub.status,
        duration: sub.duration,
        title: sub.quiz.title,
        quizId: sub.quiz.id,
        type: "regular" as const,
      })),
      ...aiAttempts.map((attempt) => ({
        id: attempt.id,
        date: attempt.completedAt || new Date(),
        score: attempt.score,
        status: attempt.status,
        duration: attempt.totalTimeSpent,
        title: attempt.quiz.title,
        quizId: attempt.quiz.id,
        slug: attempt.quiz.slug,
        type: "ai" as const,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const totalCount = totalRegularCount + totalAICount;

    // Get user's current streak from User table
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true },
    });

    const achievementRecords = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      select: {
        id: true,
        unlockedAt: true,
        achievement: {
          select: {
            id: true,
            name: true,
            icon: true,
            isLocked: true,
            type: true,
          },
        },
      },
    });

    // Flatten the achievements
    const achievements = achievementRecords.map((record) => ({
      id: record.achievement.id,
      name: record.achievement.name,
      icon: record.achievement.icon,
      isLocked: record.achievement.isLocked,
      type: record.achievement.type,
      unlockedAt: record.unlockedAt,
    }));

    if (totalCount === 0) {
      return NextResponse.json({
        stats: {
          quizzesTaken: 0,
          highestScore: 0,
          averageScore: 0,
          streak: user?.streak || 0,
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
    const totalScore = allAttempts.reduce(
      (acc, attempt) => acc + attempt.score,
      0
    );
    const averageScore =
      allAttempts.length > 0 ? Math.round(totalScore / allAttempts.length) : 0;
    const highestScore =
      allAttempts.length > 0
        ? Math.max(...allAttempts.map((attempt) => attempt.score))
        : 0;

    // Performance over time (last 10 quizzes from current page)
    const performance = allAttempts
      .slice(0, 10)
      .reverse()
      .map((attempt, index) => ({
        name: `Quiz ${totalCount - skip - index}`,
        score: attempt.score,
        title: attempt.title,
      }));

    // Find rank (by average score)
    const allUserStats = await prisma.quizRecord.groupBy({
      by: ["userId"],
      _avg: { score: true },
      orderBy: { _avg: { score: "desc" } },
    });
    const rank = allUserStats.findIndex((stat) => stat.userId === userId) + 1;

    // Recent quizzes (combined from both types)
    const recentQuizzes = allAttempts.slice(0, 5).map((attempt) => ({
      attemptId: attempt.id,
      quizId: attempt.quizId,
      slug: attempt.type === "ai" ? attempt.slug : undefined,
      title: attempt.title,
      score: attempt.score,
      date: attempt.date,
      type: attempt.type,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      stats: {
        quizzesTaken,
        highestScore,
        averageScore,
        streak: user?.streak || 0,
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
