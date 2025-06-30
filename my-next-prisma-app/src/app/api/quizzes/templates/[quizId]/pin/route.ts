import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    // 🔐 Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 🧠 Extract quizId from URL path
    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split('/').slice(-2, -1)[0];

    if (!quizId) {
      return new NextResponse('Quiz ID not found in URL', { status: 400 });
    }

    // 🔍 Fetch the quiz for the user
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        creatorId: userId,
      },
    });

    if (!quiz) {
      return new NextResponse('Quiz Not Found', { status: 404 });
    }

    // 🔄 Toggle the isPinned field
    const updatedQuiz = await prisma.quiz.update({
      where: {
        id: quizId,
        creatorId: userId,
      },
      data: {
        isPinned: !quiz.isPinned,
      },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error('[QUIZ_ID_PIN]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
