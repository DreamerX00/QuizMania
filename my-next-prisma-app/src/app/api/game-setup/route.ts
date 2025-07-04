import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const setup = await prisma.gameSetup.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ setup });
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { mode, difficulty, region } = await req.json();
  if (!mode || !difficulty || !region) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const setup = await prisma.gameSetup.create({ data: { userId, mode, difficulty, region } });
  return NextResponse.json({ setup });
} 