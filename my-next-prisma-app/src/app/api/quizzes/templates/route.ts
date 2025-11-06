import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();

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

  const where: any = {
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

  const orderBy: any = {
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
