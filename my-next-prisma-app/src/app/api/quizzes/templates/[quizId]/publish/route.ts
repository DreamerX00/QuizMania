import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";
import prisma from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { withValidation, z } from "@/lib/api-validation";

const publishSchema = z.object({
  idempotencyKey: z.string().uuid().optional(),
});

const paramsSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
});

export const PATCH = withValidation(
  { body: publishSchema, params: paramsSchema },
  async (request, _context) => {
    try {
      // 🔐 Authenticate the user
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;

      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const { quizId } = request.validatedParams!;
      const { idempotencyKey } = request.validatedBody!;

      // 🔍 Check if the quiz exists and belongs to the user
      const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
      if (!quiz || quiz.creatorId !== userId) {
        return new NextResponse("Not Found", { status: 404 });
      }

      // 🚀 Check Redis cache for idempotency (if key provided)
      const redis = getRedisClient();
      if (redis && idempotencyKey) {
        const cacheKey = `publish:${userId}:${quizId}:${idempotencyKey}`;
        try {
          const cached = await redis.get(cacheKey);
          if (cached) {
            console.log(
              `[IDEMPOTENCY] Returning cached result for ${cacheKey}`
            );
            return NextResponse.json(JSON.parse(cached));
          }
        } catch (err) {
          console.error("Redis get error:", err);
          // Continue without cache
        }
      }

      // ✅ Use transaction to prevent race conditions
      const publishedQuiz = await prisma.$transaction(async (tx) => {
        // Re-fetch with latest state inside transaction
        const currentQuiz = await tx.quiz.findUnique({
          where: { id: quiz.id },
          select: {
            id: true,
            isPublished: true,
            creatorId: true,
          },
        });

        if (!currentQuiz || currentQuiz.creatorId !== userId) {
          throw new Error("Quiz not found or unauthorized");
        }

        // If already published, return existing (idempotent)
        if (currentQuiz.isPublished) {
          console.log(`[IDEMPOTENCY] Quiz ${quiz.id} already published`);
          return await tx.quiz.findUnique({ where: { id: quiz.id } });
        }

        // Publish the quiz
        return await tx.quiz.update({
          where: { id: quiz.id, creatorId: userId },
          data: {
            isPublished: true,
          },
        });
      });

      // 💾 Cache the result (24 hour TTL)
      if (redis && idempotencyKey && publishedQuiz) {
        const cacheKey = `publish:${userId}:${quizId}:${idempotencyKey}`;
        try {
          await redis.setex(cacheKey, 86400, JSON.stringify(publishedQuiz));
        } catch (err) {
          console.error("Redis setex error:", err);
          // Continue without caching
        }
      }

      return NextResponse.json(publishedQuiz);
    } catch (error) {
      console.error("[PUT_QUIZ_PUBLISH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
);
