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

    // Fetch rank history for the user, most recent first
    const history = await prisma.rankHistory.findMany({
      where: { userId },
      orderBy: { changedAt: 'desc' },
      take: 30,
    });

    // Map to include rank names/emojis
    const formatted = history.map(entry => {
      const oldRank = getRankByXP(entry.oldXp).current;
      const newRank = getRankByXP(entry.newXp).current;
      return {
        id: entry.id,
        oldRank: entry.oldRank,
        newRank: entry.newRank,
        oldRankName: oldRank.name,
        oldRankEmoji: oldRank.emoji,
        newRankName: newRank.name,
        newRankEmoji: newRank.emoji,
        oldXp: entry.oldXp,
        newXp: entry.newXp,
        changedAt: entry.changedAt,
      };
    });

    return NextResponse.json({ history: formatted });
  } catch (error) {
    console.error('Error fetching rank history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rank history' },
      { status: 500 }
    );
  }
} 