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

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check if user already liked this quiz
    const existingLike = await prisma.quizLike.findUnique({
      where: {
        quizId_userId: {
          quizId,
          userId
        }
      }
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Quiz already liked' }, { status: 400 });
    }

    // Create the like
    await prisma.quizLike.create({
      data: {
        quizId,
        userId
      }
    });

    // Update quiz like count
    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        likeCount: {
          increment: 1
        }
      }
    });

    // Update package stats for all packages containing this quiz
    await updatePackageStatsForQuiz(quizId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Delete the like
    await prisma.quizLike.delete({
      where: {
        quizId_userId: {
          quizId,
          userId
        }
      }
    });

    // Update quiz like count
    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        likeCount: {
          decrement: 1
        }
      }
    });

    // Update package stats for all packages containing this quiz
    await updatePackageStatsForQuiz(quizId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 