import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { updatePackageStats } from '@/services/updatePackageStats';

// GET: List all packages for the authenticated user, with optional isPublished filter
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isPublishedParam = req.nextUrl.searchParams.get('isPublished');
  const where: any = { userId };
  if (isPublishedParam === 'true') where.isPublished = true;
  if (isPublishedParam === 'false') where.isPublished = false;
  const packages = await prisma.quizPackage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(packages);
}

// POST: Create a new package
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  if (!data.title || !Array.isArray(data.quizIds)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const pkg = await prisma.quizPackage.create({
    data: {
      userId,
      title: data.title,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      quizIds: data.quizIds,
      price: data.price || 0,
      isPublished: false,
    },
  });

  // Update stats for the newly created package
  await updatePackageStats(pkg.id);

  return NextResponse.json(pkg);
}

// PUT: Update a package (must be owned by user)
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing package id' }, { status: 400 });
  const pkg = await prisma.quizPackage.findUnique({ where: { id: data.id } });
  if (!pkg || pkg.userId !== userId) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
  const updated = await prisma.quizPackage.update({
    where: { id: data.id },
    data: {
      title: data.title ?? pkg.title,
      description: data.description ?? pkg.description,
      imageUrl: data.imageUrl ?? pkg.imageUrl,
      quizIds: Array.isArray(data.quizIds) ? data.quizIds : pkg.quizIds,
      price: typeof data.price === 'number' ? data.price : pkg.price,
      isPublished: typeof data.isPublished === 'boolean' ? data.isPublished : pkg.isPublished,
    },
  });

  // Update stats for the updated package
  await updatePackageStats(updated.id);

  return NextResponse.json(updated);
}

// DELETE: Delete a package (must be owned by user)
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Missing package id' }, { status: 400 });
  const pkg = await prisma.quizPackage.findUnique({ where: { id: data.id } });
  if (!pkg || pkg.userId !== userId) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
  await prisma.quizPackage.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
} 