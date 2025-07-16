import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { QuizAttemptService } from '@/services/quizAttemptService';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split('/').pop(); 

    if (!quizId) {
      return new NextResponse('Quiz ID missing', { status: 400 });
    }

    const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    if (!quiz || quiz.creatorId !== userId) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[GET_QUIZ_ID]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split('/').pop();

    if (!quizId) {
      return new NextResponse('Quiz ID missing', { status: 400 });
    }
    
    const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    if (!quiz || quiz.creatorId !== userId) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const deletedQuiz = await prisma.quiz.delete({
      where: { id: quiz.id },
    });

    return NextResponse.json(deletedQuiz);
  } catch (error) {
    console.error('[QUIZ_ID_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
