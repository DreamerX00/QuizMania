import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET: List all clans, or clans the user is a member of
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const region = searchParams.get('region') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;
  const where: any = {
    ...(search ? { OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { motto: { contains: search, mode: 'insensitive' } },
    ] } : {}),
    ...(region && region !== 'All' ? { region } : {}),
  };
  const [clans, total] = await Promise.all([
    prisma.clan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        memberships: true,
        joinRequests: true,
      },
    }),
    prisma.clan.count({ where }),
  ]);
  // Map to detailed info
  const result = clans.map(clan => {
    const memberCount = clan.memberships.length;
    const isOpen = true; // TODO: add open/approval logic
    let isMember = false, hasRequested = false;
    if (userId) {
      isMember = clan.memberships.some(m => m.userId === userId);
      hasRequested = clan.joinRequests.some(r => r.userId === userId && r.status === 'PENDING');
    }
    return {
      id: clan.id,
      name: clan.name,
      motto: clan.motto,
      region: clan.region,
      emblemUrl: clan.emblemUrl,
      memberCount,
      isOpen,
      isMember,
      hasRequested,
    };
  });
  return NextResponse.json({ clans: result, total });
}

// POST: Create a new clan
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, motto, region, emblemUrl } = await req.json();
  if (!name || !region) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  // Check for duplicate name
  const exists = await prisma.clan.findUnique({ where: { name } });
  if (exists) return NextResponse.json({ error: 'Clan name already exists' }, { status: 409 });
  const clan = await prisma.clan.create({
    data: {
      name,
      motto,
      region,
      emblemUrl,
      memberships: { create: { userId, role: 'LEADER' } },
    },
    include: { memberships: true },
  });
  return NextResponse.json({ clan });
}

// DELETE: Disband a clan (only by leader)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { clanId } = await request.json();
    if (!clanId) {
      return NextResponse.json({ error: 'Clan ID required' }, { status: 400 });
    }
    // Check if user is leader
    const membership = await prisma.clanMembership.findFirst({ where: { clanId, userId, role: 'LEADER' } });
    if (!membership) {
      return NextResponse.json({ error: 'Only clan leader can disband' }, { status: 403 });
    }
    await prisma.clan.delete({ where: { id: clanId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disbanding clan:', error);
    return NextResponse.json({ error: 'Failed to disband clan' }, { status: 500 });
  }
} 