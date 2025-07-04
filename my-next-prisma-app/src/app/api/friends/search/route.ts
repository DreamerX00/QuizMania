import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET: Search users by name or alias (excluding self and existing friends/requests)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ users: [] });
    }
    // Get all user IDs already related (friends or requests)
    const relations = await prisma.friend.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId },
        ],
      },
    });
    const relatedIds = new Set([
      ...relations.map(r => r.requesterId),
      ...relations.map(r => r.addresseeId),
      userId,
    ]);
    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { alias: { contains: q, mode: 'insensitive' } },
        ],
        clerkId: { notIn: Array.from(relatedIds) },
      },
      take: 10,
    });
    return NextResponse.json({ users: users.map(u => ({
      userId: u.clerkId,
      name: u.name,
      alias: u.alias,
      avatar: u.avatarUrl,
    })) });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
} 