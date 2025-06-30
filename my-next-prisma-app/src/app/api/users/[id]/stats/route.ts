import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, context: any) {
  const { id: userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const submissions = await prisma.quizRecord.findMany({
      where: { userId },
      orderBy: { dateTaken: 'desc' },
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
    });

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      select: { id: true, name: true, icon: true, isLocked: true, unlockedAt: true, type: true },
    });

    if (submissions.length === 0) {
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
      });
    }

    const quizzesTaken = submissions.length;
    const totalScore = submissions.reduce((acc, sub) => acc + sub.score, 0);
    const averageScore = Math.round(totalScore / quizzesTaken);
    const highestScore = Math.max(...submissions.map(sub => sub.score));

    // Performance over time (last 10 quizzes)
    const performance = submissions.slice(0, 10).reverse().map((sub, index) => ({
      name: `Quiz ${submissions.length - index}`,
      score: sub.score,
      title: sub.quiz.title,
    }));

    // Find rank (by average score)
    const allUserStats = await prisma.quizRecord.groupBy({
      by: ['userId'],
      _avg: { score: true },
      orderBy: { _avg: { score: 'desc' } },
    });
    const rank = allUserStats.findIndex((stat: any) => stat.userId === userId) + 1;

    const recentQuizzes = submissions.slice(0, 5).map((sub) => ({
      id: sub.id,
      title: sub.quiz.title,
      score: sub.score,
      date: sub.dateTaken,
    }));

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
    });
  } catch (error) {
    console.error(`Error fetching stats for user ${userId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
} 