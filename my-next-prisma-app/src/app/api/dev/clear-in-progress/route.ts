import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// DEV-ONLY: Clear all in-progress attempts for this user/quiz
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { quizId } = await request.json();
  if (!quizId) return NextResponse.json({ error: 'Missing quizId' }, { status: 400 });

  // DEV ONLY: Clear all in-progress attempts for this user/quiz
  await prisma.quizRecord.updateMany({
    where: { userId, quizId, status: 'IN_PROGRESS' },
    data: { status: 'COMPLETED' }
  });

  return NextResponse.json({ success: true });
} 