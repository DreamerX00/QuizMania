import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: { quizId: string } } | { params: Promise<{ quizId: string }> }
) {
  // Await params if it's a Promise (Next.js dynamic API route requirement)
  const params = 'then' in context.params ? await context.params : context.params;
  const { quizId } = params;
  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }

  // Try to find by id or slug
  const quiz = await prisma.quiz.findFirst({
    where: {
      OR: [
        { id: quizId },
        { slug: quizId },
      ],
      isPublished: true, // Only return published quizzes
    },
    include: {
      creator: {
        select: { name: true, avatarUrl: true },
      },
    },
  });

  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // Extract questions from jsonContent (may be { questions: [...] } or just an array)
  let questions: any[] = [];
  if (quiz.jsonContent) {
    if (Array.isArray(quiz.jsonContent)) {
      questions = quiz.jsonContent;
    } else if (Array.isArray(quiz.jsonContent.questions)) {
      questions = quiz.jsonContent.questions;
    }
  }

  // Return quiz with questions array
  const safeQuiz = { ...quiz, questions };
  return NextResponse.json(safeQuiz);
} 