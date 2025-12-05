import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withParamsValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
export const revalidate = 180; // 3 minutes cache for quiz details

const quizParamsSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
});

export const GET = withParamsValidation(
  quizParamsSchema,
  async (request, _context) => {
    const { quizId } = request.validatedParams!;

    // Try to find by id or slug
    const quiz = await prisma.quiz.findFirst({
      where: {
        OR: [{ id: quizId }, { slug: quizId }],
        isPublished: true, // Only return published quizzes
      },
      include: {
        creator: {
          select: { name: true, image: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Extract questions from jsonContent (may be { questions: [...] } or just an array)
    let questions: unknown[] = [];
    if (quiz.jsonContent) {
      if (Array.isArray(quiz.jsonContent)) {
        questions = quiz.jsonContent;
      } else if (
        typeof quiz.jsonContent === "object" &&
        quiz.jsonContent !== null &&
        "questions" in quiz.jsonContent &&
        Array.isArray(quiz.jsonContent.questions)
      ) {
        questions = quiz.jsonContent.questions;
      }
    }

    // Return quiz with questions array
    const safeQuiz = { ...quiz, questions };
    return NextResponse.json(safeQuiz);
  }
);
