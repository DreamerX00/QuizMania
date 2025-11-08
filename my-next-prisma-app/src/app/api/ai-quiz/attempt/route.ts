import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const CreateAttemptSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  userId: z.string().min(1, "User ID is required"),
  answers: z.record(z.string(), z.string()).optional().default({}),
  timeRemaining: z.number().optional(),
  status: z
    .enum(["IN_PROGRESS", "COMPLETED"])
    .optional()
    .default("IN_PROGRESS"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = CreateAttemptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { quizId, userId, answers, status } = validation.data;

    // Verify user owns this attempt
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch quiz to ensure it exists
    const quiz = await prisma.aIGeneratedQuiz.findUnique({
      where: { id: quizId },
      select: { id: true, questionCount: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get the next attempt number for this user+quiz
    const lastAttempt = await prisma.aIQuizAttempt.findFirst({
      where: { quizId, userId },
      orderBy: { attemptNumber: "desc" },
      select: { attemptNumber: true },
    });

    // Create new attempt
    const attempt = await prisma.aIQuizAttempt.create({
      data: {
        quizId,
        userId,
        attemptNumber: (lastAttempt?.attemptNumber || 0) + 1,
        status: status.toLowerCase(),
        answers: answers,
        totalQuestions: quiz.questionCount,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
    });
  } catch (error) {
    console.error("Error creating attempt:", error);
    return NextResponse.json(
      { error: "Failed to create attempt" },
      { status: 500 }
    );
  }
}
