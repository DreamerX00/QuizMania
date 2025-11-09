import prisma from "../src/lib/prisma";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { QuizAttemptService } from "../src/services/quizAttemptService";

describe("startAttempt concurrency", () => {
  let userId: string;
  let quizId: string;

  beforeAll(async () => {
    // Create a disposable test user and quiz
    const user = await prisma.user.create({
      data: { email: `test+${Date.now()}@example.com`, name: "Test User" },
    });
    const quiz = await prisma.quiz.create({
      data: { slug: `test-quiz-${Date.now()}`, title: "Test Quiz" },
    });
    userId = user.id;
    quizId = quiz.id;
  });

  afterAll(async () => {
    // Clean up created records
    await prisma.quizRecord.deleteMany({ where: { quizId } });
    await prisma.attempt.deleteMany({ where: { quizId } });
    await prisma.quiz.deleteMany({ where: { id: quizId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("only one start succeeds under concurrent calls", async () => {
    const parallel = 6;
    const results = await Promise.all(
      new Array(parallel)
        .fill(0)
        .map(() =>
          QuizAttemptService.startAttempt(userId, quizId).catch((e) => ({
            success: false,
            reason: e?.message,
          }))
        )
    );

    const successCount = results.filter((r: any) => r && r.success).length;
    // Expect exactly 1 success and the rest to be failures (already in-progress)
    expect(successCount).toBe(1);
  }, 20000);
});
