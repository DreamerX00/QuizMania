import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const invalidateSessionSchema = z.object({
  sessionId: z.string().min(1),
});

export const POST = withValidation(invalidateSessionSchema, async (request: any) => {
  try {
    const { sessionId } = request.validated;
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId.' }, { status: 400 });
    }
    await prisma.quizLinkSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to invalidate session.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}); 