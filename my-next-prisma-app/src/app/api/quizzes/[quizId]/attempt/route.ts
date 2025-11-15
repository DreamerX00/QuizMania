import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";
import { updatePackageStatsForQuiz } from "@/services/updatePackageStats";
import { z } from "zod";
import { withValidation } from "@/utils/validation";
import { QuizStatus, Prisma } from "@prisma/client";

// Accept either a simple score-based submission or a structured submission
const structuredSchema = z.object({
  quizRecordId: z.string().min(1).optional(),
  // Simple summary fields (legacy/support)
  score: z.number().min(0).max(100).optional(),
  totalMarks: z.number().min(1).optional(),
  duration: z.number().min(0).optional(),
  status: z.string().optional(),
  // Structured submission (responses + summary)
  submittedAt: z.string().optional(),
  responses: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.any(),
        type: z.string(),
        requiresManualReview: z.boolean().optional(),
      })
    )
    .optional(),
  summary: z.any().optional(),
  violations: z.any().optional(),
});

export const POST = withValidation(
  structuredSchema,
  async (
    request: NextRequest & { validated?: z.infer<typeof structuredSchema> },
    { params }: { params: Promise<{ quizId: string }> }
  ) => {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const body = request.validated as z.infer<typeof structuredSchema>;

    try {
      // If responses are present, treat as a structured submission
      if (body.responses && body.summary) {
        // submitStructuredAttempt will locate the in-progress QuizRecord internally
        const rawResponses = body.responses as Array<{
          questionId: string;
          answer: unknown;
          type: string;
          requiresManualReview?: boolean;
        }>;

        const responses = rawResponses.map((r) => ({
          questionId: r.questionId,
          answer: r.answer as Prisma.JsonValue,
          type: r.type,
          requiresManualReview: !!r.requiresManualReview,
        }));

        const res = await QuizAttemptService.submitStructuredAttempt({
          userId,
          quizId,
          submittedAt: body.submittedAt
            ? new Date(body.submittedAt)
            : new Date(),
          responses,
          summary: body.summary,
          violations: body.violations,
        });
        // Update package stats and return structured response
        await updatePackageStatsForQuiz(quizId);
        return NextResponse.json(res);
      }

      // Otherwise expect a score-based submission; require quizRecordId
      const {
        quizRecordId,
        score,
        totalMarks,
        duration,
        status = "COMPLETED",
      } = body;
      if (!quizRecordId) {
        return NextResponse.json(
          { error: "quizRecordId is required for simple submissions" },
          { status: 400 }
        );
      }

      const quizStatus =
        status === "COMPLETED" ||
        status === "IN_PROGRESS" ||
        status === "FAILED"
          ? (status as QuizStatus)
          : QuizStatus.COMPLETED;

      const result = await QuizAttemptService.submitAttempt(
        userId,
        quizId,
        quizRecordId,
        score ?? 0,
        totalMarks ?? 0,
        duration ?? 0,
        quizStatus
      );
      await updatePackageStatsForQuiz(quizId);
      return NextResponse.json({
        success: true,
        earnedPoints: result.earnedPoints,
        isNewBestScore: result.isNewBestScore,
        previousBestScore: result.previousBestScore,
        totalAttempts: result.totalAttempts,
        averageScore: result.averageScore,
      });
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      if (error instanceof Error) {
        if (error.message.includes("Premium subscription required")) {
          return NextResponse.json(
            {
              error: "Premium subscription required for this quiz",
              requiresPremium: true,
            },
            { status: 403 }
          );
        }
        if (error.message.includes("Daily attempt limit reached")) {
          return NextResponse.json(
            { error: error.message, limitReached: true },
            { status: 429 }
          );
        }
        if (error.message.includes("Cannot attempt quiz")) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// GET endpoint to check if user can attempt a quiz
const quizIdParamSchema = z.object({ quizId: z.string().min(1) });
export const GET = withValidation(
  quizIdParamSchema,
  async (
    request: NextRequest & { validated?: z.infer<typeof quizIdParamSchema> },
    { params }: { params: Promise<{ quizId: string }> }
  ) => {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }
    try {
      const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
      const validation = await QuizAttemptService.validateAttempt(
        userId,
        quiz.id
      );
      return NextResponse.json(validation);
    } catch (error) {
      console.error("Error validating quiz attempt:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
