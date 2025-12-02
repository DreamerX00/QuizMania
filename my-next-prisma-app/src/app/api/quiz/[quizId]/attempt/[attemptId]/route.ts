import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/utils/validation";
import validator from "validator";

const paramsSchema = z.object({
  quizId: z.string().min(1).max(64).trim(),
  attemptId: z.string().min(1).max(64).trim(),
});

export const GET = withValidation(paramsSchema, async (request, ...args) => {
  const { params } = args[0] as {
    params: { quizId: string; attemptId: string };
  };
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { quizId, attemptId } = params;
  // Resolve quiz by id or slug
  const quiz = await prisma.quiz.findFirst({
    where: {
      OR: [{ id: quizId }, { slug: quizId }],
    },
    select: { id: true, title: true, slug: true },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  // Fetch the attempt (QuizRecord)
  const record = await prisma.quizRecord.findUnique({
    where: { id: attemptId },
    include: {
      questionRecords: true,
      quiz: { select: { title: true, id: true, slug: true } },
    },
  });
  if (!record || record.quizId !== quiz.id) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (record.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Fetch manual review queue for this attempt
  const manualReviews = await prisma.manualReviewQueue.findMany({
    where: { quizRecordId: attemptId },
    select: {
      id: true,
      questionId: true,
      marksAwarded: true,
      reviewed: true,
      feedback: true,
      reviewedBy: true,
      reviewedAt: true,
      type: true,
    },
  });
  // Sanitize all user-facing strings
  const sanitize = (str: string | null | undefined) =>
    str ? validator.escape(str) : "";
  // Aggregate revised marks
  const revisedMarks = manualReviews.reduce(
    (sum, r) => sum + (r.marksAwarded ?? 0),
    0
  );
  const allReviewed =
    manualReviews.length > 0 && manualReviews.every((r) => r.reviewed);
  return NextResponse.json({
    attempt: {
      id: record.id,
      quizId: record.quizId,
      score: record.score,
      duration: record.duration,
      dateTaken: record.dateTaken,
      status: record.status,
      isManualReviewPending: record.isManualReviewPending,
      revisedMarks,
      allReviewed,
      autoMarks: record.score,
      quizTitle: sanitize(record.quiz?.title),
      questionRecords: record.questionRecords,
    },
    manualReviews: manualReviews.map((r) => ({
      ...r,
      feedback: sanitize(r.feedback),
      type: sanitize(r.type),
      reviewedBy: sanitize(r.reviewedBy),
    })),
  });
});
