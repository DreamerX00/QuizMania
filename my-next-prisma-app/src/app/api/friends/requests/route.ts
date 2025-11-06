import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

// GET: List all pending friend requests for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Incoming requests
    const incoming = await prisma.friend.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      include: { requester: true },
      orderBy: { createdAt: 'desc' },
    });
    // Outgoing requests
    const outgoing = await prisma.friend.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: { addressee: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      incoming: incoming.map(r => ({
        id: r.id,
        userId: r.requester.id,
        name: r.requester.name,
        alias: r.requester.alias,
        avatar: r.requester.avatarUrl,
        createdAt: r.createdAt,
      })),
      outgoing: outgoing.map(r => ({
        id: r.id,
        userId: r.addressee.id,
        name: r.addressee.name,
        alias: r.addressee.alias,
        avatar: r.addressee.avatarUrl,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error listing friend requests:', error);
    return NextResponse.json({ error: 'Failed to list friend requests' }, { status: 500 });
  }
}

const friendRequestActionSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(['accept', 'decline']),
});

export const POST = withValidation(friendRequestActionSchema, async (request: any) => {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { requestId, action } = request.validated;
    const friendRequest = await prisma.friend.findUnique({ where: { id: requestId } });
    if (!friendRequest || friendRequest.addresseeId !== userId || friendRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request not found or not allowed' }, { status: 404 });
    }
    const updated = await prisma.friend.update({
      where: { id: requestId },
      data: { status: action === 'accept' ? 'ACCEPTED' : 'DECLINED' },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Error updating friend request:', error);
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 });
  }
}); 