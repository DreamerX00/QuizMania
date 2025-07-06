import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// POST: Join a room by code
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    // Find room by code
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: { memberships: { include: { user: true } } },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.roomMembership.findFirst({
      where: { roomId: room.id, userId },
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member of this room' }, { status: 409 });
    }

    // Check if room is full
    if (room.memberships.length >= room.maxParticipants) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Join the room
    const membership = await prisma.roomMembership.create({
      data: {
        roomId: room.id,
        userId,
        role: 'PLAYER',
      },
      include: { user: true },
    });

    return NextResponse.json({ 
      room: {
        id: room.id,
        name: room.name,
        code: room.code,
        type: room.type,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt,
      },
      membership 
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
} 