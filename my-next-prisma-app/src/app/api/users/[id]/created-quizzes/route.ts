import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const params = await context.params;
  if (!userId || userId !== params.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract pagination params
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || "20", 10),
    100
  );
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
