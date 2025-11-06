import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/lib/session';
import { QuizAttemptService } from "@/services/quizAttemptService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split("/").pop();

    if (!quizId) {
      return new NextResponse("Quiz ID missing", { status: 400 });
    }

    const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    if (!quiz || quiz.creatorId !== userId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[GET_QUIZ_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const quizIdParamSchema = z.object({ quizId: z.string().min(1) });

export const DELETE = withValidation(
  quizIdParamSchema,
  async (request: any, { params }: { params: { quizId: string } }) => {
    try {
      const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      const { quizId } = params;
      if (!quizId) {
        return new NextResponse("Quiz ID missing", { status: 400 });
      }
      const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
      if (!quiz || quiz.creatorId !== userId) {
        return new NextResponse("Not Found", { status: 404 });
      }
      const deletedQuiz = await prisma.quiz.delete({
        where: { id: quiz.id },
      });
      return NextResponse.json(deletedQuiz);
    } catch (error) {
      console.error("[QUIZ_ID_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
);
