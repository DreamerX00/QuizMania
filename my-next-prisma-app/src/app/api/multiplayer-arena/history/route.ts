import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getRankByXP } from '@/utils/rank';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent multiplayer arena matches (QuizRecords)
    const records = await prisma.quizRecord.findMany({
      where: { userId },
      orderBy: { dateTaken: 'desc' },
      take: 20,
      include: {
        questionRecords: true,
        quiz: { select: { title: true, id: true } },
      },
    });

    // Fetch user XP for rank
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const xp = user?.xp || 0;
    const rankInfo = getRankByXP(xp);

    // Format response
    const history = records.map(r => ({
      id: r.id,
      quizId: r.quizId,
      quizTitle: r.quiz?.title || '',
      dateTaken: r.dateTaken,
      score: r.score,
      duration: r.duration,
      earnedPoints: r.earnedPoints,
      status: r.status,
      totalQuestions: r.questionRecords.length,
      correct: r.questionRecords.filter(q => q.isCorrect).length,
    }));

    return NextResponse.json({
      history,
      xp,
      rank: rankInfo.current,
      nextRank: rankInfo.next,
      progressPercent: rankInfo.progressPercent,
    });
  } catch (error) {
    console.error('Error fetching multiplayer arena history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch multiplayer arena history' },
      { status: 500 }
    );
  }
} 