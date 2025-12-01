import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { updatePackageStatsForQuiz } from "@/services/updatePackageStats";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

const quizIdParamSchema = z.object({ quizId: z.string().min(1) });

export const POST = withValidation(
  quizIdParamSchema,
  async (request: any, { params }: { params: Promise<{ quizId: string }> }) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { quizId } = request.validated;
      // Check if quiz exists
      const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
      // Check if user already liked this quiz
      const existingLike = await prisma.quizLike.findUnique({
        where: {
          quizId_userId: {
            quizId,
            userId,
          },
        },
      });
      if (existingLike) {
        return NextResponse.json(
          { error: "Quiz already liked" },
          { status: 400 }
        );
      }
      // Create the like
      await prisma.quizLike.create({ data: { quizId, userId } });
      // Update quiz like count
      await prisma.quiz.update({
        where: { id: quizId },
        data: { likeCount: { increment: 1 } },
      });
      // Update package stats for all packages containing this quiz
      await updatePackageStatsForQuiz(quizId);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error liking quiz:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withValidation(
  quizIdParamSchema,
  async (request: any, { params }: { params: Promise<{ quizId: string }> }) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { quizId } = request.validated;
      // Delete the like
      await prisma.quizLike.delete({
        where: {
          quizId_userId: {
            quizId,
            userId,
          },
        },
      });
      // Update quiz like count
      await prisma.quiz.update({
        where: { id: quizId },
        data: { likeCount: { decrement: 1 } },
      });
      // Update package stats for all packages containing this quiz
      await updatePackageStatsForQuiz(quizId);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error unliking quiz:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
