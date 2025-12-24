import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getPricingConfig } from "@/constants/pricing";
import slugify from "slugify";
import { z } from "zod";
import { withValidation } from "@/utils/validation";
import prisma from "@/lib/prisma";
import { DifficultyLevel } from "@/generated/prisma/client";
import { getRedisClient } from "@/lib/redis";

const createQuizSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().min(0).optional(),
  field: z.string().min(2).max(50),
  subject: z.string().min(2).max(50),
  questions: z.any(), // You may want to further validate the structure
  isPublished: z.boolean().optional(),
  durationInSeconds: z.number().int().min(0).max(7200).optional(),
  isLocked: z.boolean().optional(),
  lockPassword: z.string().max(100).optional(),
  difficultyLevel: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export const POST = withValidation(createQuizSchema, async (req) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = req.validated;
    const {
      title,
      description,
      tags,
      imageUrl,
      price,
      field,
      subject,
      questions,
      isPublished,
      durationInSeconds,
      isLocked,
      lockPassword,
      difficultyLevel,
      idempotencyKey,
    } = body;

    // 🚀 Check Redis cache for idempotency (if key provided)
    const redis = getRedisClient();
    if (redis && idempotencyKey) {
      const cacheKey = `quiz:create:${userId}:${idempotencyKey}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log(`[IDEMPOTENCY] Returning cached quiz for ${cacheKey}`);
          return NextResponse.json(JSON.parse(cached), { status: 201 });
        }
      } catch (err) {
        console.error("Redis get error:", err);
        // Continue without cache
      }
    }

    // Auto-set pricing based on difficulty level
    let pricePerAttempt = 0;
    let pointPerAttempt = 0;
    if (difficultyLevel) {
      const pricingConfig = getPricingConfig(
        difficultyLevel as DifficultyLevel
      );
      pricePerAttempt = pricingConfig.pricePerAttempt;
      pointPerAttempt = pricingConfig.pointPerAttempt;
    }

    // Generate a unique, URL-safe slug from the title
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.quiz.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        slug,
        title,
        description,
        tags,
        imageUrl,
        price: price || 0,
        pricePerAttempt,
        pointPerAttempt,
        field,
        subject,
        jsonContent: questions,
        isPublished: isPublished,
        creatorId: userId,
        durationInSeconds:
          typeof durationInSeconds === "number" ? durationInSeconds : 0,
        isLocked: !!isLocked,
        lockPassword: isLocked && lockPassword ? lockPassword : undefined,
        difficultyLevel:
          (difficultyLevel as DifficultyLevel | undefined) || undefined,
      },
    });

    // 💾 Cache the result (24 hour TTL)
    if (redis && idempotencyKey) {
      const cacheKey = `quiz:create:${userId}:${idempotencyKey}`;
      try {
        await redis.setex(cacheKey, 86400, JSON.stringify(newQuiz));
      } catch (err) {
        console.error("Redis setex error:", err);
        // Continue without caching
      }
    }

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Something went wrong", error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
});
