import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { CACHE_STRATEGIES } from "@/lib/prisma-cache";

export const dynamic = "force-dynamic";
export const revalidate = 180; // Revalidate every 3 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const tags = searchParams.get("tags")?.split(",");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const field = searchParams.get("field");
    const subject = searchParams.get("subject");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );
    const skip = (page - 1) * limit;

    const where: Prisma.QuizWhereInput = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (field) where.field = field;
    if (subject) where.subject = subject;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const orderBy: Prisma.QuizOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute query with pagination and get total count
    // Use caching for quiz listings (3 minutes cache)
    const [quizzes, totalCount] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          creator: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip,
        cacheStrategy: CACHE_STRATEGIES.QUIZ_LIST,
      }),
      prisma.quiz.count({ where, cacheStrategy: CACHE_STRATEGIES.QUIZ_LIST }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      data: quizzes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
