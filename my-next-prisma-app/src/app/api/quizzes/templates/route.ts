import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes cache for templates

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const minPrice = parseInt(searchParams.get("minPrice") || "0", 10);
  const maxPriceParam = searchParams.get("maxPrice");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const maxPrice = maxPriceParam ? parseInt(maxPriceParam, 10) : 999;

  const where: {
    creatorId: string;
    isPublished: boolean;
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      tags?: { has: string };
    }>;
    price?: { gte?: number; lte?: number };
    createdAt?: { gte?: Date; lte?: Date };
  } = {
    creatorId: userId,
    isPublished: false,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  if (minPrice > 0 || (maxPriceParam && maxPrice < 999)) {
    where.price = {};
    if (minPrice > 0) {
      where.price.gte = minPrice;
    }
    if (maxPriceParam && maxPrice < 999) {
      where.price.lte = maxPrice;
    }
  }

  if (fromDate) {
    where.createdAt = { ...where.createdAt, gte: new Date(fromDate) };
  }
  if (toDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(toDate) };
  }

  const orderBy: { createdAt?: "asc" | "desc"; price?: "asc" | "desc" } = {
    [sortBy]: sortOrder,
  };

  try {
    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy,
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("[GET_TEMPLATES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
