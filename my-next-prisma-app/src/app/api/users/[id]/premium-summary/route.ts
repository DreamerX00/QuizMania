import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Get user's premium summary from actual usage data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        accountType: true,
        premiumUntil: true,
        createdQuizzes: {
          where: { isTemplate: true },
          select: { id: true },
        },
        aiGeneratedQuizzes: {
          select: { id: true },
        },
        quizzes: {
          select: { duration: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate actual stats
    const templatesUsed = user.aiGeneratedQuizzes.length;
    const quizPacks = user.createdQuizzes.length;

    // Estimate time saved (5 mins per AI-generated quiz)
    const timeSaved = templatesUsed * 5;

    // Calculate dollar value based on account type
    const dollarValueMap: Record<string, number> = {
      FREE: 0,
      PREMIUM: 9.99,
      PREMIUM_PLUS: 19.99,
      LIFETIME: 99.99,
    };
    const dollarValue = dollarValueMap[user.accountType] || 0;

    return NextResponse.json({
      templatesUsed,
      quizPacks,
      timeSaved,
      dollarValue,
      userId: id,
      accountType: user.accountType,
      premiumUntil: user.premiumUntil,
    });
  } catch (error) {
    console.error("Error fetching premium summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch premium summary" },
      { status: 500 }
    );
  }
}
