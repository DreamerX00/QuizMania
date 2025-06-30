import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { clerkId, email, name, avatarUrl } = await request.json();
  console.log('Received sync request:', { clerkId, email, name, avatarUrl });
  if (!clerkId || !email) {
    console.log('Missing clerkId or email');
    return NextResponse.json({ error: 'Missing clerkId or email' }, { status: 400 });
  }
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
    console.log('User upserted:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to sync user:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
} 