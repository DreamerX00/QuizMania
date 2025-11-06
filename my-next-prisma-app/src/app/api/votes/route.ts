import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
  const votes = await prisma.vote.findMany({
    where: { roomId },
    select: { type: true, count: true },
  });
  return NextResponse.json({ votes });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { roomId, type } = await req.json();
  if (!roomId || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  // Upsert vote for this user/room/type
  await prisma.vote.upsert({
    where: { userId_roomId_type: { userId, roomId, type } },
    update: {},
    create: { userId, roomId, type, count: 1 },
  });
  // Recount
  const votes = await prisma.vote.findMany({
    where: { roomId },
    select: { type: true, count: true },
  });
  return NextResponse.json({ votes });
} 