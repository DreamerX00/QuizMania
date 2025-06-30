import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { getPricingConfig } from '@/constants/pricing';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      title,
      description,
      tags,
      imageUrl,
      price,
      field,
      subject,
      questions,
      isPublished,
      durationInSeconds,
      isLocked,
      lockPassword,
      difficultyLevel,
    } = body;

    // Basic validation
    if (!title || !field || !subject || !questions) {
      return NextResponse.json({ message: 'Missing required quiz data' }, { status: 400 });
    }

    // Auto-set pricing based on difficulty level
    let pricePerAttempt = 0;
    let pointPerAttempt = 0;
    
    if (difficultyLevel) {
      const pricingConfig = getPricingConfig(difficultyLevel);
      pricePerAttempt = pricingConfig.pricePerAttempt;
      pointPerAttempt = pricingConfig.pointPerAttempt;
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        description,
        tags,
        imageUrl,
        price: price || 0,
        pricePerAttempt,
        pointPerAttempt,
        field,
        subject,
        jsonContent: questions,
        isPublished: isPublished,
        creatorId: auth.userId, // Use Clerk userId from session
        durationInSeconds: typeof durationInSeconds === 'number' ? durationInSeconds : 0,
        isLocked: !!isLocked,
        lockPassword: isLocked && lockPassword ? lockPassword : undefined,
        difficultyLevel: difficultyLevel || undefined,
      },
    });

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    console.error('Failed to create quiz:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Something went wrong', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 