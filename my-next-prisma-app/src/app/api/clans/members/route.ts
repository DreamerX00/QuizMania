import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';

// GET: List members of a clan
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const clanId = searchParams.get('clanId');
    if (!clanId) {
      return NextResponse.json({ error: 'Clan ID required' }, { status: 400 });
    }
    const members = await prisma.clanMembership.findMany({
      where: { clanId },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error listing clan members:', error);
    return NextResponse.json({ error: 'Failed to list clan members' }, { status: 500 });
  }
}

// POST: Add a member (by leader/elder)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { clanId, newUserId, role } = await request.json();
    if (!clanId || !newUserId) {
      return NextResponse.json({ error: 'Clan ID and user ID required' }, { status: 400 });
    }
    // Only leader/elder can add
    const membership = await prisma.clanMembership.findFirst({ where: { clanId, userId, role: { in: ['LEADER', 'ELDER'] } } });
    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    // Add member
    const newMember = await prisma.clanMembership.create({
      data: {
        clanId,
        userId: newUserId,
        role: role || 'MEMBER',
      },
      include: { user: true },
    });
    return NextResponse.json({ member: newMember });
  } catch (error) {
    console.error('Error adding clan member:', error);
    return NextResponse.json({ error: 'Failed to add clan member' }, { status: 500 });
  }
}

// DELETE: Remove a member (by leader/elder or self-leave)
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { clanId, removeUserId } = await request.json();
    if (!clanId || !removeUserId) {
      return NextResponse.json({ error: 'Clan ID and user ID required' }, { status: 400 });
    }
    // Only leader/elder or self can remove
    const membership = await prisma.clanMembership.findFirst({ where: { clanId, userId, role: { in: ['LEADER', 'ELDER'] } } });
    if (userId !== removeUserId && !membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await prisma.clanMembership.deleteMany({ where: { clanId, userId: removeUserId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing clan member:', error);
    return NextResponse.json({ error: 'Failed to remove clan member' }, { status: 500 });
  }
} 