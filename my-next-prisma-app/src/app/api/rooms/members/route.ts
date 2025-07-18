import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

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
    
    // Get user data from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { roomId, newUserId, role } = await request.json();
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }
    if (!newUserId || newUserId === userId) {
      // Join self
      const existing = await prisma.roomMembership.findFirst({ where: { roomId, userId } });
      if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });
      
      // Ensure user exists in the database
      await prisma.user.upsert({
        where: { clerkId: userId },
        update: {},
        create: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || 'unknown@example.com',
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.username || 'Unknown User',
          avatarUrl: user.imageUrl,
        },
      });
      
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
      
      // For adding other users, we need to get their data from Clerk
      // This is a simplified approach - in production you might want to fetch their data differently
      await prisma.user.upsert({
        where: { clerkId: newUserId },
        update: {},
        create: {
          clerkId: newUserId,
          email: `user-${newUserId}@example.com`, // Placeholder email
          name: `User ${newUserId.slice(-4)}`, // Placeholder name
        },
      });
      
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

const removeMemberSchema = z.object({
  roomId: z.string().min(1),
  userId: z.string().min(1),
});

export const DELETE = withValidation(removeMemberSchema, async (request: any) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { roomId, userId: targetUserId } = request.validated;
    if (!roomId || !targetUserId) {
      return NextResponse.json({ error: 'Room ID and user ID required' }, { status: 400 });
    }
    // Check if user is host of the room
    const hostMembership = await prisma.roomMembership.findFirst({
      where: { roomId, userId, role: 'HOST' },
    });
    if (!hostMembership) {
      return NextResponse.json({ error: 'Not authorized to kick players' }, { status: 403 });
    }
    // Check if target user is a member
    const targetMembership = await prisma.roomMembership.findFirst({
      where: { roomId, userId: targetUserId },
    });
    if (!targetMembership) {
      return NextResponse.json({ error: 'User is not a member of this room' }, { status: 404 });
    }
    // Prevent host from kicking themselves
    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Cannot kick yourself' }, { status: 400 });
    }
    // Remove the member
    await prisma.roomMembership.delete({
      where: { id: targetMembership.id },
    });
    return NextResponse.json({ success: true, message: 'Player kicked successfully' });
  } catch (error) {
    console.error('Error kicking room member:', error);
    return NextResponse.json({ error: 'Failed to kick room member' }, { status: 500 });
  }
}); 