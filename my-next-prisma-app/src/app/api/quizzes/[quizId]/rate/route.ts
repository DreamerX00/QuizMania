import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { updatePackageStatsForQuiz } from '@/services/updatePackageStats';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    const { value } = await request.json();
    if (!value || value < 1 || value > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Upsert the rating (create or update)
    await prisma.quizRating.upsert({
      where: {
        quizId_userId: {
          quizId,
          userId
        }
      },
      update: {
        value
      },
      create: {
        quizId,
        userId,
        value
      }
    });

    // Calculate new average rating
    const ratings = await prisma.quizRating.findMany({
      where: { quizId },
      select: { value: true }
    });

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length 
      : 0;

    // Update quiz average rating
    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        rating: Math.round(averageRating * 10) / 10
      }
    });

    // Update package stats for all packages containing this quiz
    await updatePackageStatsForQuiz(quizId);

    return NextResponse.json({ 
      success: true, 
      averageRating: Math.round(averageRating * 10) / 10 
    });
  } catch (error) {
    console.error('Error rating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 