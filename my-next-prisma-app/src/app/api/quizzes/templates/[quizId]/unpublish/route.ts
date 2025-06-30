import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    // 🔐 Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 🧠 Extract quizId from the pathname
    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split('/').slice(-2, -1)[0];

    // 🚫 Validate quizId format
    if (!quizId || typeof quizId !== 'string' || quizId.length < 5) {
      return new NextResponse('Invalid Quiz ID', { status: 400 });
    }

    // 🔍 Fetch quiz and check ownership
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        creatorId: userId, // Ensures the logged-in user is the owner
      },
    });

    if (!quiz) {
      return new NextResponse('Quiz not found or you are not the creator', { status: 404 });
    }

    // ⛔ Already unpublished — no need to update
    if (!quiz.isPublished) {
      return NextResponse.json({
        message: 'Quiz is already unpublished',
        quiz,
      });
    }

    // ✅ Update the quiz to unpublished
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        isPublished: false,
      },
    });

    // 🚀 (Optional) Add user notification or activity log here

    return NextResponse.json({
      message: 'Quiz unpublished successfully',
      quiz: updatedQuiz,
    });

  } catch (error) {
    console.error('[QUIZ_UNPUBLISH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
