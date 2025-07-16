import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { QuizAttemptService } from '@/services/quizAttemptService';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    // Await params if it's a Promise (Next.js dynamic API route requirement)
    const params = 'then' in context.params ? await context.params : context.params;
    console.log('Received quiz id/slug:', params.id);
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in DB
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
    // Fetch quiz by id or slug
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
    const body = await request.json();
    const { fingerprint, deviceInfo } = body;
    // Get IP address from request
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

    // Generate and return a unique quiz link with sessionId
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
} 