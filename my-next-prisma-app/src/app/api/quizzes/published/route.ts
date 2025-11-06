import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from '@/lib/session';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const sortByParam = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const allowedSortFields = ["createdAt", "price", "title"];
    const sortBy = allowedSortFields.includes(sortByParam || "")
      ? sortByParam
      : "createdAt";

    const where: Prisma.QuizWhereInput = {
      creatorId: userId,
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (!isNaN(Number(minPrice))) where.price.gte = Number(minPrice);
      if (!isNaN(Number(maxPrice))) where.price.lte = Number(maxPrice);
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate && !isNaN(Date.parse(fromDate)))
        where.createdAt.gte = new Date(fromDate);
      if (toDate && !isNaN(Date.parse(toDate)))
        where.createdAt.lte = new Date(toDate);
    }

    const orderBy: Prisma.QuizOrderByWithRelationInput = {
      [sortBy!]: sortOrder,
    };

    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy,
      take: 50,
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Failed to fetch published quizzes:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
