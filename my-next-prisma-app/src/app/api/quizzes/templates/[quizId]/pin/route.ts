import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";
import prisma from "@/lib/prisma";
import { withParamsValidation, z } from "@/lib/api-validation";

const pinParamsSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
});

export const PATCH = withParamsValidation(
  pinParamsSchema,
  async (request, _context) => {
    try {
      // 🔐 Get authenticated user
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;

      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const { quizId } = request.validatedParams!;

      // 🔍 Fetch the quiz for the user
      const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
      if (!quiz || quiz.creatorId !== userId) {
        return new NextResponse("Quiz Not Found", { status: 404 });
      }

      // 🔄 Toggle the isPinned field
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quiz.id, creatorId: userId },
        data: { isPinned: !quiz.isPinned },
      });

      return NextResponse.json(updatedQuiz);
    } catch (error) {
      console.error("[QUIZ_ID_PIN]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
);
