import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
) {
  try {
    // 🔐 Authenticate the user
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 🧠 Extract the quizId from the request URL
    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split('/').slice(-2, -1)[0];

    if (!quizId) {
      return new NextResponse('Quiz ID missing', { status: 400 });
    }

    // 🔍 Check if the quiz exists and belongs to the user
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        creatorId: userId,
      },
    });

    if (!quiz) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // ✅ Update the quiz to mark it as published
    const publishedQuiz = await prisma.quiz.update({
      where: {
        id: quizId,
        creatorId: userId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedQuiz);
  } catch (error) {
    console.error('[QUIZ_ID_PUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
