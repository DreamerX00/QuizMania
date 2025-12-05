import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { withQueryValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
export const revalidate = 180; // Revalidate every 3 minutes

const listQuizzesSchema = z.object({
  search: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  field: z.string().optional(),
  subject: z.string().optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
});

export const GET = withQueryValidation(listQuizzesSchema, async (req) => {
  try {
    const {
      search,
      tags,
      sortBy,
      sortOrder,
      field,
      subject,
      minPrice,
      maxPrice,
      page,
      limit,
    } = req.validatedQuery!;
    const skip = (page - 1) * Math.min(100, Math.max(1, limit));

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
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagsArray.length > 0) {
        where.tags = { hasSome: tagsArray };
      }
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
      }),
      prisma.quiz.count({ where }),
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
});
