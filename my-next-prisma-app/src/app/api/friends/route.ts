import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

// GET: List all friends for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Find all accepted friends (bidirectional)
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: true,
        addressee: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    // Map to friend user info
    const mapped = friends.map(f => {
      const isRequester = f.requesterId === userId;
      const friendUser = isRequester ? f.addressee : f.requester;
      return {
        id: f.id,
        userId: friendUser.clerkId,
        name: friendUser.name,
        alias: friendUser.alias,
        avatar: friendUser.avatarUrl,
        status: 'online', // TODO: Replace with real status if available
        pinned: false, // TODO: Add pin support if needed
        createdAt: f.createdAt,
      };
    });
    return NextResponse.json({ friends: mapped });
  } catch (error) {
    console.error('Error listing friends:', error);
    return NextResponse.json({ error: 'Failed to list friends' }, { status: 500 });
  }
}

const friendRequestSchema = z.object({
  addresseeId: z.string().min(1),
});

const friendDeleteSchema = z.object({
  otherUserId: z.string().min(1),
});

export const POST = withValidation(friendRequestSchema, async (request: any) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { addresseeId } = request.validated;
    if (addresseeId === userId) {
      return NextResponse.json({ error: 'Invalid addressee' }, { status: 400 });
    }
    // Check for existing relationship
    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId },
          { requesterId: addresseeId, addresseeId: userId },
        ],
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'Friend request already exists or you are already friends' }, { status: 409 });
    }
    // Create friend request
    const requestRecord = await prisma.friend.create({
      data: {
        requesterId: userId,
        addresseeId,
        status: 'PENDING',
      },
    });
    return NextResponse.json({ success: true, request: requestRecord });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
});

export const DELETE = withValidation(friendDeleteSchema, async (request: any) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { otherUserId } = request.validated;
    if (otherUserId === userId) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }
    // Remove any friend relationship (bidirectional)
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }
}); 