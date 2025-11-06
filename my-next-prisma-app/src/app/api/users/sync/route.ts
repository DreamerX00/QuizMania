import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const syncUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
});

export const POST = withValidation(syncUserSchema, async (request: any) => {
  const { clerkId, email, name, avatarUrl } = request.validated;
  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        name,
        avatarUrl,
      },
      create: {
        clerkId,
        email,
        name,
        avatarUrl,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to sync user:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}); 