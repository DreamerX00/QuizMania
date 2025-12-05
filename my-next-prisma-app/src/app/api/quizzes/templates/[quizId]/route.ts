import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";
import { z } from "zod";
import { withParamsValidation } from "@/lib/api-validation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes cache

const templateParamsSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
});

export const GET = withParamsValidation(
  templateParamsSchema,
  async (request, _context) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;

      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const { quizId } = request.validatedParams!;

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
);

const quizIdParamSchema = z.object({ quizId: z.string().min(1) });

export const DELETE = withParamsValidation(
  quizIdParamSchema,
  async (request, _context) => {
    const { quizId } = request.validatedParams!;
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
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
