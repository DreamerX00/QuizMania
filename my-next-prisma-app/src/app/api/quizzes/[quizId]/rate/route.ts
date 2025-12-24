import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { updatePackageStatsForQuiz } from "@/services/updatePackageStats";
import { QuizAttemptService } from "@/services/quizAttemptService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

const rateQuizSchema = z.object({
  quizId: z.string().min(1),
  value: z.number().int().min(1).max(5),
});

export const POST = withValidation(
  rateQuizSchema,
  async (request, ..._args) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { quizId, value } = request.validated;
      // Check if quiz exists
      const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
      // Upsert the rating (create or update)
      await prisma.quizRating.upsert({
        where: {
          quizId_userId: {
            quizId: quiz.id,
            userId,
          },
        },
        update: { value },
        create: { quizId: quiz.id, userId, value },
      });
      // Calculate new average rating
      const ratings = await prisma.quizRating.findMany({
        where: { quizId: quiz.id },
        select: { value: true },
      });
      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum: number, r: (typeof ratings)[number]) => sum + r.value,
              0
            ) / ratings.length
          : 0;
      // Update quiz average rating
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: { rating: Math.round(averageRating * 10) / 10 },
      });
      // Update package stats for all packages containing this quiz
      await updatePackageStatsForQuiz(quiz.id);
      return NextResponse.json({
        success: true,
        averageRating: Math.round(averageRating * 10) / 10,
      });
    } catch (error) {
      console.error("Error rating quiz:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
