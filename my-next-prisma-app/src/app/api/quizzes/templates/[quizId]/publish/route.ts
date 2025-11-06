import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/lib/session';
import { QuizAttemptService } from "@/services/quizAttemptService";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    // 🔐 Authenticate the user
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 🧠 Extract the quizId from the request URL
    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split("/").slice(-2, -1)[0];

    if (!quizId) {
      return new NextResponse("Quiz ID missing", { status: 400 });
    }

    // 🔍 Check if the quiz exists and belongs to the user
    const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    if (!quiz || quiz.creatorId !== userId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // ✅ Update the quiz to mark it as published
    const publishedQuiz = await prisma.quiz.update({
      where: { id: quiz.id, creatorId: userId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedQuiz);
  } catch (error) {
    console.error("[QUIZ_ID_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
