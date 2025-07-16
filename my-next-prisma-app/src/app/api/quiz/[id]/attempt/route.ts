import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { QuizAttemptService } from '@/services/quizAttemptService';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const submitAttemptSchema = z.object({
  quizId: z.string().min(1),
  submittedAt: z.string().datetime().optional(),
  responses: z.array(z.any()), // You may want to further validate the structure
  summary: z.object({
    obtainedMarks: z.number(),
    durationInSeconds: z.number().optional(),
  }),
  violations: z.object({
    count: z.number().optional(),
    reasons: z.array(z.string()).optional(),
  }).optional(),
});

export const POST = withValidation(submitAttemptSchema, async (request: any, { params }: { params: { id: string } }) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { quizId, submittedAt, responses, summary, violations } = request.validated;
  try {
    // Find the in-progress QuizRecord for this user and quiz
    const quizRecord = await prisma.quizRecord.findFirst({
      where: {
        userId,
        quizId,
        status: 'IN_PROGRESS',
      },
    });
    if (!quizRecord) {
      return NextResponse.json({ error: 'No in-progress quiz record found' }, { status: 404 });
    }
    // Update QuizRecord with responses, summary, and mark as completed
    const isFlagged = violations && violations.count && violations.count > 0;
    await prisma.quizRecord.update({
      where: { id: quizRecord.id },
      data: {
        responses,
        status: 'COMPLETED',
        dateTaken: submittedAt ? new Date(submittedAt) : new Date(),
        isManualReviewPending: responses.some((r: any) => r.requiresManualReview),
        score: summary.obtainedMarks,
        duration: summary.durationInSeconds || 0,
        isFlagged,
      },
    });
    // Store violations in QuizViolation table
    if (violations && Array.isArray(violations.reasons) && violations.reasons.length > 0) {
      await prisma.$transaction(
        violations.reasons.map((reason: string) =>
          prisma.quizViolation.create({
            data: {
              quizRecordId: quizRecord.id,
              userId,
              quizId,
              type: 'violation',
              reason,
              isFlagged: true,
            },
          })
        )
      );
    }
    // Add manual review items to ManualReviewQueue
    const manualItems = responses.filter((r: any) => r.requiresManualReview);
    if (manualItems.length > 0) {
      await prisma.$transaction(
        manualItems.map((r: any) =>
          prisma.manualReviewQueue.create({
            data: {
              quizRecordId: quizRecord.id,
              questionId: r.questionId,
              userId,
              quizId,
              answer: r.answer,
              type: r.type,
            },
          })
        )
      );
    }
    return NextResponse.json({
      success: true,
      summary,
      manualReviewPending: manualItems.length > 0,
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    );
  }
});

const idParamSchema = z.object({ id: z.string().min(1) });
export const GET = withValidation(idParamSchema, async (request: any, { params }: { params: { id: string } }) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const quiz = await QuizAttemptService.resolveQuizIdentifier(params.id);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    const validation = await QuizAttemptService.validateAttempt(userId, quiz.id);
    const attemptHistory = await QuizAttemptService.getAttemptHistory(userId, quiz.id);
    const dailyAttempts = await QuizAttemptService.getDailyAttempts(userId, quiz.id);
    const quizDetails = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      select: {
        id: true,
        title: true,
        difficultyLevel: true,
        pricePerAttempt: true,
        pointPerAttempt: true,
        isPublished: true
      }
    });
    if (!quizDetails) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json({
      canAttempt: validation.canAttempt,
      reason: validation.reason,
      remainingAttempts: validation.remainingAttempts,
      dailyLimit: validation.dailyLimit,
      requiresPayment: validation.requiresPayment,
      isUnlocked: validation.isUnlocked,
      attemptHistory,
      dailyAttempts: dailyAttempts.length,
      quiz: quizDetails
    });
  } catch (error) {
    console.error('Error getting attempt info:', error);
    return NextResponse.json(
      { error: 'Failed to get attempt information' },
      { status: 500 }
    );
  }
}); 