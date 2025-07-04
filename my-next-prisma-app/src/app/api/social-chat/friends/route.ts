import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const friendId = searchParams.get('friendId');
  if (!friendId) return NextResponse.json({ error: 'Missing friendId' }, { status: 400 });
  const messages = await prisma.friendChat.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { clerkId: true, name: true, avatarUrl: true } },
      receiver: { select: { clerkId: true, name: true, avatarUrl: true } },
    },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { friendId, message } = await req.json();
  if (!friendId || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const chat = await prisma.friendChat.create({
    data: { senderId: userId, receiverId: friendId, message },
  });
  return NextResponse.json({ chat });
} 