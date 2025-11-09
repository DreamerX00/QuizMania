import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ quizId: string }> }
) {
  const params = await context.params;
  const { quizId } = params;
  if (!quizId) {
    return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
  }

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
