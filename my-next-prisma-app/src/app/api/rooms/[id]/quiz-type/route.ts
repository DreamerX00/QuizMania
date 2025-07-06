import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizType } = await request.json();
    const { id: roomId } = params;

    // Check if user is host of the room
    const membership = await prisma.roomMembership.findFirst({
      where: { roomId, userId, role: 'HOST' },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Update room quiz type
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { quizType },
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error updating quiz type:', error);
    return NextResponse.json({ error: 'Failed to update quiz type' }, { status: 500 });
  }
} 