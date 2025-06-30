import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId || userId !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const quizzes = await prisma.quiz.findMany({ where: { creatorId: userId } });
    return NextResponse.json(quizzes);
} 