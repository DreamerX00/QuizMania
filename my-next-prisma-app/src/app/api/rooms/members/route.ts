import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET: List members of a room
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }
    const members = await prisma.roomMembership.findMany({
      where: { roomId },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error listing room members:', error);
    return NextResponse.json({ error: 'Failed to list room members' }, { status: 500 });
  }
}

// POST: Join a room (self) or add member (by host)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { roomId, newUserId, role } = await request.json();
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }
    if (!newUserId || newUserId === userId) {
      // Join self
      const existing = await prisma.roomMembership.findFirst({ where: { roomId, userId } });
      if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });
      const member = await prisma.roomMembership.create({
        data: { roomId, userId, role: 'PLAYER' },
        include: { user: true },
      });
      return NextResponse.json({ member });
    } else {
      // Add member (by host)
      const host = await prisma.roomMembership.findFirst({ where: { roomId, userId, role: 'HOST' } });
      if (!host) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      const existing = await prisma.roomMembership.findFirst({ where: { roomId, userId: newUserId } });
      if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });
      const member = await prisma.roomMembership.create({
        data: { roomId, userId: newUserId, role: role || 'PLAYER' },
        include: { user: true },
      });
      return NextResponse.json({ member });
    }
  } catch (error) {
    console.error('Error adding room member:', error);
    return NextResponse.json({ error: 'Failed to add room member' }, { status: 500 });
  }
}

// DELETE: Leave or remove member (by host or self)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { roomId, removeUserId } = await request.json();
    if (!roomId || !removeUserId) {
      return NextResponse.json({ error: 'Room ID and user ID required' }, { status: 400 });
    }
    // Only host or self can remove
    const host = await prisma.roomMembership.findFirst({ where: { roomId, userId, role: 'HOST' } });
    if (userId !== removeUserId && !host) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await prisma.roomMembership.deleteMany({ where: { roomId, userId: removeUserId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing room member:', error);
    return NextResponse.json({ error: 'Failed to remove room member' }, { status: 500 });
  }
} 