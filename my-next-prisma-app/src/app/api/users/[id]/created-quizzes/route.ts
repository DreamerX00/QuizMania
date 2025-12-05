import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { withValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

const createdQuizzesParamsSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

const createdQuizzesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
});

export const GET = withValidation(
  { params: createdQuizzesParamsSchema, query: createdQuizzesQuerySchema },
  async (req, _context) => {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    const { id } = req.validatedParams!;

    if (!userId || userId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { page, limit: rawLimit } = req.validatedQuery!;
    const limit = Math.min(rawLimit, 100);
    const skip = (page - 1) * limit;

    // Fetch quizzes and total count in parallel
    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where: { creatorId: userId },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          field: true,
          subject: true,
          createdAt: true,
          updatedAt: true,
          isPublished: true,
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
      }),
      prisma.quiz.count({ where: { creatorId: userId } }),
    ]);

    return NextResponse.json({
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + quizzes.length < total,
      },
    });
  }
);
