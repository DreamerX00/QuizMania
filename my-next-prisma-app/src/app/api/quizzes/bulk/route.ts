import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });
  const idsParam = req.nextUrl.searchParams.get('ids');
  if (!idsParam) return NextResponse.json([]);
  const ids = idsParam.split(',').filter(Boolean);
  if (ids.length === 0) return NextResponse.json([]);
  const quizzes: any[] = [];
  for (const id of ids) {
    try {
      const quiz = await QuizAttemptService.resolveQuizIdentifier(id);
      if (quiz && quiz.creatorId === userId) {
        quizzes.push({
          id: quiz.id,
          title: quiz.title,
          imageUrl: quiz.imageUrl,
          description: quiz.description,
          isPublished: quiz.isPublished,
          slug: quiz.slug,
        });
      }
    } catch {}
  }
  return NextResponse.json(quizzes);
} 