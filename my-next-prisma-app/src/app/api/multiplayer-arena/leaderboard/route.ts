import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getRankByXP } from '@/utils/rank';

export async function GET(request: NextRequest) {
  try {
    // Get top 20 users by XP
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 20,
      select: {
        clerkId: true,
        name: true,
        avatarUrl: true,
        xp: true,
      },
    });
    const leaderboard = users.map((u, i) => ({
      userId: u.clerkId,
      name: u.name,
      avatarUrl: u.avatarUrl,
      xp: u.xp,
      rank: getRankByXP(u.xp).current,
      position: i + 1,
    }));
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 