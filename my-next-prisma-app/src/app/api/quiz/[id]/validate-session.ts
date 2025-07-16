import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QuizAttemptService } from '@/services/quizAttemptService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const quizId = params.id;
  const sessionId = request.nextUrl.searchParams.get('session');
  if (!sessionId) {
    return NextResponse.json({ valid: false, error: 'Missing session.' }, { status: 400 });
  }

  // Optionally, get device info and IP from request for extra validation
  const ip = request.headers.get('x-forwarded-for') || request.ip || '';

  const session = await prisma.quizLinkSession.findUnique({
    where: { id: sessionId },
  });

  const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
  if (!quiz) {
    return NextResponse.json({ valid: false, error: 'Quiz not found.' }, { status: 404 });
  }
  if (!session || !session.isActive || session.quizId !== quiz.id) {
    return NextResponse.json({ valid: false, error: 'Session not found or inactive.' }, { status: 404 });
  }

  // Optionally, check IP match (can be relaxed for NAT/mobile users)
  if (session.ip && ip && session.ip !== ip) {
    // Invalidate session
    await prisma.quizLinkSession.update({ where: { id: sessionId }, data: { isActive: false } });
    return NextResponse.json({ valid: false, error: 'IP mismatch.' }, { status: 403 });
  }

  // Optionally, check for expiration (e.g., 1 hour)
  const now = new Date();
  const created = new Date(session.createdAt);
  const maxAgeMs = 60 * 60 * 1000; // 1 hour
  if (now.getTime() - created.getTime() > maxAgeMs) {
    await prisma.quizLinkSession.update({ where: { id: sessionId }, data: { isActive: false } });
    return NextResponse.json({ valid: false, error: 'Session expired.' }, { status: 403 });
  }

  // If all checks pass, session is valid
  return NextResponse.json({ valid: true });
} 