import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { withQueryValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes cache for templates

const templatesQuerySchema = z.object({
  search: z.string().optional(),
  minPrice: z.string().regex(/^\d+$/).transform(Number).default("0"),
  maxPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const GET = withQueryValidation(
  templatesQuerySchema,
  async (request) => {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      search = "",
      minPrice,
      maxPrice,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
    } = request.validatedQuery!;
    const maxPriceValue = maxPrice ?? 999;

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

    if (minPrice > 0 || (maxPrice && maxPriceValue < 999)) {
      where.price = {};
      if (minPrice > 0) {
        where.price.gte = minPrice;
      }
      if (maxPrice && maxPriceValue < 999) {
        where.price.lte = maxPriceValue;
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
);
