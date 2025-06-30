import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });
  const idsParam = req.nextUrl.searchParams.get('ids');
  if (!idsParam) return NextResponse.json([]);
  const ids = idsParam.split(',').filter(Boolean);
  if (ids.length === 0) return NextResponse.json([]);
  const quizzes = await prisma.quiz.findMany({
    where: {
      id: { in: ids },
      creatorId: userId,
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      description: true,
      isPublished: true,
    },
  });
  return NextResponse.json(quizzes);
} 