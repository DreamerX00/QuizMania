import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const startQuizSchema = z.object({
  fingerprint: z.string().min(1).max(256),
  deviceInfo: z.record(z.any()).optional(),
});

export const POST = withValidation(startQuizSchema, async (request: any, context: { params: { id: string } } | { params: Promise<{ id: string }> }) => {
  try {
    const params = 'then' in context.params ? await context.params : context.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || 'unknown@example.com',
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.username || 'Unknown User',
        avatarUrl: user.imageUrl,
      },
    });
    const { id: quizId } = await params;
    let quiz;
    try {
      quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Quiz not found' },
        { status: 404 }
      );
    }
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    const { fingerprint, deviceInfo } = request.validated;
    const ip = request.headers.get('x-forwarded-for') || '';
    const result = await QuizAttemptService.startAttempt(userId, quiz.id, fingerprint, deviceInfo, ip);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.reason,
          ...result
        }, 
        { status: 400 }
      );
    }
    const quizLink = result.sessionId
      ? `https://quizmania.app/quiz/${quiz.slug}/take?session=${result.sessionId}`
      : null;
    return NextResponse.json({ ...result, quizLink });
  } catch (error: any) {
    console.error('Error starting quiz attempt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start quiz attempt' },
      { status: error.message?.includes('Quiz not found') ? 404 : 500 }
    );
  }
}); 