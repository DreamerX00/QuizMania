// API Route: POST /api/ai-quiz/generate
// Generate a new AI quiz

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/ai-quiz/providers";
import { checkQuota, consumeQuota } from "@/lib/ai-quiz/quota-manager";
import {
  getDifficultyTier,
  getBaselineXP,
} from "@/lib/ai-quiz/difficulty-mapper";
import { QuizConfig } from "@/types/ai-quiz";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;

    // Check quota
    const quotaStatus = await checkQuota(userId);
    if (!quotaStatus.hasQuota) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          message: `You have used all ${quotaStatus.total} quiz generations for today. Please try again tomorrow.`,
          resetAt: quotaStatus.resetAt,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const config: QuizConfig = await request.json();

    // Comprehensive validation
    if (!config.providerId || !config.subject || !config.difficultyLevel) {
      return NextResponse.json(
        { error: "Invalid configuration: Missing required fields" },
        { status: 400 }
      );
    }

    // Validate providerId exists in database
    const provider = await prisma.aIProvider.findUnique({
      where: { id: config.providerId },
    });

    if (!provider || !provider.isActive) {
      // Fallback to first active provider
      const defaultProvider = await prisma.aIProvider.findFirst({
        where: { isActive: true },
        orderBy: { isRecommended: "desc" },
      });

      if (!defaultProvider) {
        return NextResponse.json(
          { error: "No active AI providers available" },
          { status: 503 }
        );
      }

      config.providerId = defaultProvider.id;
    }

    // Validate subject length
    if (config.subject.length < 2 || config.subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be between 2 and 200 characters" },
        { status: 400 }
      );
    }

    // Validate topics
    if (!config.topics || config.topics.length === 0) {
      return NextResponse.json(
        { error: "At least one topic is required" },
        { status: 400 }
      );
    }

    if (config.topics.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 topics allowed" },
        { status: 400 }
      );
    }

    // Validate difficulty level
    if (config.difficultyLevel < 1 || config.difficultyLevel > 10) {
      return NextResponse.json(
        { error: "Difficulty level must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Validate question count
    if (
      config.questionCount < 5 ||
      config.questionCount > 50 ||
      config.questionCount % 5 !== 0
    ) {
      return NextResponse.json(
        {
          error: "Question count must be between 5 and 50 (in increments of 5)",
        },
        { status: 400 }
      );
    }

    // Sanitize custom instructions
    if (config.customInstructions) {
      if (config.customInstructions.length > 500) {
        return NextResponse.json(
          { error: "Custom instructions must not exceed 500 characters" },
          { status: 400 }
        );
      }
      // Remove any potential HTML/script tags
      config.customInstructions = config.customInstructions
        .replace(/<[^>]*>/g, "")
        .trim();
    }

    // Sanitize all text inputs
    config.subject = config.subject.trim();
    config.topics = config.topics
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (config.domain) config.domain = config.domain.trim();
    if (config.className) config.className = config.className.trim();

    if (config.questionCount < 5 || config.questionCount > 50) {
      return NextResponse.json(
        { error: "Question count must be between 5 and 50" },
        { status: 400 }
      );
    }

    // Consume quota
    const consumed = await consumeQuota(userId);
    if (!consumed) {
      return NextResponse.json(
        { error: "Failed to consume quota" },
        { status: 500 }
      );
    }

    try {
      // Get provider details from database
      const dbProvider = await prisma.aIProvider.findUnique({
        where: { id: config.providerId },
        select: { type: true, modelName: true },
      });

      if (!dbProvider) {
        throw new Error("Provider not found");
      }

      // Map database provider type to provider factory format
      let providerKey: string;
      switch (dbProvider.type) {
        case "OPENAI":
          providerKey = "openai-gpt4o";
          break;
        case "ANTHROPIC":
          providerKey = "anthropic-sonnet";
          break;
        case "GOOGLE_GEMINI":
          providerKey = "gemini-pro";
          break;
        case "DEEPSEEK":
          providerKey = "deepseek";
          break;
        default:
          providerKey = "openai-gpt4o"; // fallback
      }

      // Try to get the provider, fallback to OpenAI if it fails
      let provider: ReturnType<typeof getProvider>;
      try {
        provider = getProvider(providerKey);
      } catch (error) {
        console.warn(
          `Failed to get provider ${providerKey}, falling back to OpenAI:`,
          error
        );
        providerKey = "openai-gpt4o";
        provider = getProvider(providerKey);
      }

      // Generate quiz with error handling and fallback to other providers
      let generatedQuiz: Awaited<
        ReturnType<typeof provider.generateQuestions>
      > | null = null;
      const fallbackOrder = [
        "gemini-pro",
        "deepseek",
        "openai-gpt4o",
        "anthropic-sonnet",
      ];
      const attempedProviders = [providerKey];

      try {
        generatedQuiz = await provider.generateQuestions(config);
      } catch (error) {
        console.warn(`Provider ${providerKey} failed:`, error);

        // Try fallback providers in order
        for (const fallbackKey of fallbackOrder) {
          if (attempedProviders.includes(fallbackKey)) continue;

          try {
            console.log(`Trying fallback provider: ${fallbackKey}`);
            const fallbackProvider = getProvider(fallbackKey);
            generatedQuiz = await fallbackProvider.generateQuestions(config);
            providerKey = fallbackKey;
            console.log(`Fallback to ${fallbackKey} succeeded`);
            break;
          } catch (fallbackError) {
            console.warn(
              `Fallback provider ${fallbackKey} also failed:`,
              fallbackError
            );
            attempedProviders.push(fallbackKey);
          }
        }

        if (!generatedQuiz) {
          throw new Error(
            `All AI providers failed. Attempted: ${attempedProviders.join(
              ", "
            )}. Last error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      if (!generatedQuiz) {
        throw new Error("Failed to generate quiz with any provider");
      }

      // Get difficulty tier
      const difficultyTier = getDifficultyTier(config.difficultyLevel);

      // Calculate base XP
      const baseXP = getBaselineXP(
        config.difficultyLevel,
        config.questionCount
      );

      // Generate slug
      const slug = `ai-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`;

      // Create quiz in database
      const aiQuiz = await prisma.aIGeneratedQuiz.create({
        data: {
          slug,
          userId,
          providerId: config.providerId,
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          subject: config.subject,
          className: config.className,
          domain: config.domain,
          topics: config.topics,
          difficultyLevel: config.difficultyLevel,
          difficultyTier,
          questionCount: config.questionCount,
          aiPrompt: "", // Store if needed
          aiResponse: "", // Store if needed
          generationTime: Date.now() - startTime,
          tokensUsed:
            (generatedQuiz as { metadata?: { tokensUsed?: number } }).metadata
              ?.tokensUsed || 0,
          modelUsed:
            (generatedQuiz as { metadata?: { model?: string } }).metadata
              ?.model || config.providerId,
          generatedAt: new Date(),
          questions: JSON.parse(JSON.stringify(generatedQuiz.questions)),
          timeLimit: config.timeLimit,
          allowSkip: config.allowSkip,
          showExplanations: config.showExplanations,
          shuffleQuestions: config.shuffleQuestions,
          shuffleOptions: config.shuffleOptions,
          status: "ACTIVE",
          baseXP,
          bonusXPMultiplier: 1.0,
          perfectScoreBonus: Math.round(baseXP * 0.25),
          speedBonusEnabled: true,
        },
        include: {
          provider: {
            select: {
              name: true,
              modelName: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          quizId: aiQuiz.id,
          slug: aiQuiz.slug,
          title: aiQuiz.title,
          description: aiQuiz.description,
          questionCount: aiQuiz.questionCount,
          baseXP: aiQuiz.baseXP,
          estimatedTime: generatedQuiz.estimatedTime,
          difficultyLevel: aiQuiz.difficultyLevel,
          generationTime: aiQuiz.generationTime,
        },
      });
    } catch (error) {
      // Refund quota on error (only if user was authenticated)
      if (userId) {
        try {
          const { refundQuota } = await import("@/lib/ai-quiz/quota-manager");
          await refundQuota(userId);
        } catch (refundError) {
          console.error("Failed to refund quota:", refundError);
        }
      }

      console.error("Quiz generation error:", error);
      return NextResponse.json(
        {
          error: "Failed to generate quiz",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
