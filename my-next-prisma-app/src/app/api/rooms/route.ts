import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET: List all rooms, or rooms the user is a member of
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const my = searchParams.get('my');
    let rooms;
    if (my === '1') {
      rooms = await prisma.room.findMany({
        where: {
          memberships: { some: { userId } },
        },
        include: { memberships: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      rooms = await prisma.room.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error listing rooms:', error);
    return NextResponse.json({ error: 'Failed to list rooms' }, { status: 500 });
  }
}

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  maxPlayers: z.number().min(2).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  quizTypes: z.array(z.string().min(1)).optional(),
  password: z.string().max(100).optional().nullable(),
});

export const POST = withValidation(createRoomSchema, async (request: any) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name, maxPlayers, type, quizTypes, password } = request.validated;
    // Generate unique code
    let code;
    while (true) {
      code = generateRoomCode();
      const exists = await prisma.room.findUnique({ where: { code } });
      if (!exists) break;
    }
    // Create room and add creator as host
    const room = await prisma.room.create({
      data: {
        name,
        code,
        type: type || 'Public',
        maxParticipants: maxPlayers || 8,
        quizTypes: quizTypes || [],
        password: password || null,
        memberships: {
          create: {
            userId,
            role: 'HOST',
          },
        },
      },
      include: { memberships: true },
    });
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
});

const deleteRoomSchema = z.object({
  roomId: z.string().min(1),
});

export const DELETE = withValidation(deleteRoomSchema, async (request: any) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { roomId } = request.validated;
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }
    // Check if user is host
    const membership = await prisma.roomMembership.findFirst({ where: { roomId, userId, role: 'HOST' } });
    if (!membership) {
      return NextResponse.json({ error: 'Only host can delete room' }, { status: 403 });
    }
    await prisma.room.delete({ where: { id: roomId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}); 