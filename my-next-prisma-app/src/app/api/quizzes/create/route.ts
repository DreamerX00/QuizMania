import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { getPricingConfig } from '@/constants/pricing';
import slugify from 'slugify';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const prisma = new PrismaClient();

const createQuizSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().min(0).optional(),
  field: z.string().min(2).max(50),
  subject: z.string().min(2).max(50),
  questions: z.any(), // You may want to further validate the structure
  isPublished: z.boolean().optional(),
  durationInSeconds: z.number().int().min(0).max(7200).optional(),
  isLocked: z.boolean().optional(),
  lockPassword: z.string().max(100).optional(),
  difficultyLevel: z.string().optional(),
});

export const POST = withValidation(createQuizSchema, async (req: any) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = req.validated;
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

    // Auto-set pricing based on difficulty level
    let pricePerAttempt = 0;
    let pointPerAttempt = 0;
    if (difficultyLevel) {
      const pricingConfig = getPricingConfig(difficultyLevel);
      pricePerAttempt = pricingConfig.pricePerAttempt;
      pointPerAttempt = pricingConfig.pointPerAttempt;
    }

    // Generate a unique, URL-safe slug from the title
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.quiz.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        slug,
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
        creatorId: auth.userId,
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
}); 