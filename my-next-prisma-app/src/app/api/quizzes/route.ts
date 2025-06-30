import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const field = searchParams.get('field');
    const subject = searchParams.get('subject');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: Prisma.QuizWhereInput = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (field) where.field = field;
    if (subject) where.subject = subject;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    
    const orderBy: Prisma.QuizOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy,
      take: 20,
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 