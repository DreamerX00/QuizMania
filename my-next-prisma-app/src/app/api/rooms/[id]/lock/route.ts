import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const lockRoomSchema = z.object({
  locked: z.boolean(),
});

export const PATCH = withValidation(lockRoomSchema, async (request: any, { params }: { params: { id: string } }) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { locked } = request.validated;
    const { id: roomId } = params;
    // Check if user is host of the room
    const membership = await prisma.roomMembership.findFirst({
      where: { roomId, userId, role: 'HOST' },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    // Update room lock status
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { isLocked: locked },
    });
    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error updating room lock:', error);
    return NextResponse.json({ error: 'Failed to update room lock' }, { status: 500 });
  }
}); 