import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { updatePackageStats } from "@/services/updatePackageStats";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes cache for packages

// GET: List all packages for the authenticated user, with optional isPublished filter
export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isPublishedParam = req.nextUrl.searchParams.get("isPublished");
  const where: any = { userId };
  if (isPublishedParam === "true") where.isPublished = true;
  if (isPublishedParam === "false") where.isPublished = false;
  const packages = await prisma.quizPackage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(packages);
}

const createPackageSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  quizIds: z.array(z.string().min(1)),
  price: z.number().min(0).optional(),
});

const updatePackageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  quizIds: z.array(z.string().min(1)).optional(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
});

const deletePackageSchema = z.object({
  id: z.string().min(1),
});

export const POST = withValidation(createPackageSchema, async (req: any) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = req.validated;
  const pkg = await prisma.quizPackage.create({
    data: {
      userId,
      title: data.title,
      description: data.description || "",
      imageUrl: data.imageUrl || "",
      quizIds: data.quizIds,
      price: data.price || 0,
      isPublished: false,
    },
  });
  await updatePackageStats(pkg.id);
  return NextResponse.json(pkg);
});

export const PUT = withValidation(updatePackageSchema, async (req: any) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = req.validated;
  const pkg = await prisma.quizPackage.findUnique({ where: { id: data.id } });
  if (!pkg || pkg.userId !== userId)
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  const updated = await prisma.quizPackage.update({
    where: { id: data.id },
    data: {
      title: data.title ?? pkg.title,
      description: data.description ?? pkg.description,
      imageUrl: data.imageUrl ?? pkg.imageUrl,
      quizIds: Array.isArray(data.quizIds) ? data.quizIds : pkg.quizIds,
      price: typeof data.price === "number" ? data.price : pkg.price,
      isPublished:
        typeof data.isPublished === "boolean"
          ? data.isPublished
          : pkg.isPublished,
    },
  });
  await updatePackageStats(updated.id);
  return NextResponse.json(updated);
});

export const DELETE = withValidation(deletePackageSchema, async (req: any) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = req.validated;
  const pkg = await prisma.quizPackage.findUnique({ where: { id: data.id } });
  if (!pkg || pkg.userId !== userId)
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  await prisma.quizPackage.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
});
