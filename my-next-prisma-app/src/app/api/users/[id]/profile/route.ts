import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

function withNotSetFields(user: any) {
  return {
    ...user,
    name: user.name || 'Not set',
    avatarUrl: user.avatarUrl || 'Not set',
    bannerUrl: user.bannerUrl || 'Not set',
    bio: user.bio || 'Not set',
    alias: user.alias || 'Not set',
    socials: user.socials || 'Not set',
    region: user.region || 'Not set',
  };
}

export async function GET(request: Request, context: any) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId || userId !== id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let user = await prisma.user.findUnique({ 
    where: { clerkId: userId },
    include: {
      premiumSummary: true
    }
  });
  if (!user) {
    // Try to fetch from Clerk and upsert
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      if (clerkUser) {
        user = await prisma.user.upsert({
          where: { clerkId: userId },
          update: {
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : undefined,
            avatarUrl: clerkUser.imageUrl,
          },
          create: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : undefined,
            avatarUrl: clerkUser.imageUrl,
          },
          include: {
            premiumSummary: true
          }
        });
      }
    } catch (e) {
      return NextResponse.json({ error: 'User not found and failed to sync from Clerk' }, { status: 404 });
    }
  }
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(withNotSetFields(user));
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  alias: z.string().max(50).optional(),
  socials: z.string().max(200).optional(),
  region: z.string().max(100).optional(),
});

export const PATCH = withValidation(updateProfileSchema, async (request: any, context: any) => {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId || userId !== id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = request.validated;
    const updated = await prisma.user.update({
      where: { clerkId: id },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
        bio: data.bio,
        alias: data.alias,
        socials: data.socials,
        region: data.region,
      },
      select: {
        clerkId: true,
        email: true,
        name: true,
        avatarUrl: true,
        bannerUrl: true,
        createdAt: true,
        role: true,
        xp: true,
        rank: true,
        streak: true,
        accountType: true,
        points: true,
        premiumUntil: true,
        bio: true,
        alias: true,
        socials: true,
        region: true,
        premiumSummary: true,
      },
    });
    return NextResponse.json(withNotSetFields(updated));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}); 