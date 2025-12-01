import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";
import { withValidation } from "@/utils/validation";
import prisma from "@/lib/prisma";

const quizIdParamSchema = z.object({ quizId: z.string().min(1) });

export const PATCH = withValidation(
  quizIdParamSchema,
  async (request: any, { params }: { params: { quizId: string } }) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      const { quizId } = params;
      if (!quizId || typeof quizId !== "string" || quizId.length < 5) {
        return new NextResponse("Invalid Quiz ID", { status: 400 });
      }
      const quiz = await prisma.quiz.findUnique({
        where: {
          id: quizId,
          creatorId: userId,
        },
      });
      if (!quiz) {
        return new NextResponse("Quiz not found or you are not the creator", {
          status: 404,
        });
      }
      if (!quiz.isPublished) {
        return NextResponse.json({
          message: "Quiz is already unpublished",
          quiz,
        });
      }
      const updatedQuiz = await prisma.quiz.update({
        where: { id: quizId },
        data: {
          isPublished: false,
        },
      });
      return NextResponse.json({
        message: "Quiz unpublished successfully",
        quiz: updatedQuiz,
      });
    } catch (error) {
      console.error("[QUIZ_UNPUBLISH]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
);
