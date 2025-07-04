import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const messages = await prisma.publicChat.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { sender: { select: { clerkId: true, name: true, avatarUrl: true } } },
  });
  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  const chat = await prisma.publicChat.create({
    data: { senderId: userId, message },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
  });
  return NextResponse.json({ chat });
} 