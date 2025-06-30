import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const packageId = req.nextUrl.searchParams.get('id');
  if (!packageId) return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });

  try {
    // Get the package with real-time stats
    const pkg = await prisma.quizPackage.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        title: true,
        price: true,
        totalAttempts: true,
        totalLikes: true,
        earnings: true,
        averageRating: true,
        averageScore: true,
        quizIds: true,
        userId: true
      }
    });

    if (!pkg || pkg.userId !== userId) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Return the real-time stats directly from the package
    return NextResponse.json({
      attempts: pkg.totalAttempts,
      likes: pkg.totalLikes,
      earnings: pkg.earnings,
      averageRating: pkg.averageRating,
      averageScore: pkg.averageScore,
      quizCount: pkg.quizIds.length,
      packagePrice: pkg.price
    });

  } catch (error) {
    console.error('Error fetching package stats:', error);
    return NextResponse.json({ error: 'Failed to fetch package statistics' }, { status: 500 });
  }
} 