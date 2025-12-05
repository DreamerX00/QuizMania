import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { withQueryValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
export const revalidate = 180; // 3 minutes cache

const publishedQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "price", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const GET = withQueryValidation(publishedQuerySchema, async (req) => {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { search, sortBy, sortOrder, minPrice, maxPrice, fromDate, toDate } =
      req.validatedQuery!;

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
});
