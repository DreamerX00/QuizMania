import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

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

// POST: Create a new room
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Room name required' }, { status: 400 });
    }
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
}

// DELETE: Delete a room (only by host)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { roomId } = await request.json();
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
} 