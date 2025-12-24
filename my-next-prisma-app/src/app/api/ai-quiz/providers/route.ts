// API Route: GET /api/ai-quiz/providers
// List all available AI providers from database

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes cache for providers list

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active providers from database
    const providers = await prisma.aIProvider.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        modelName: true,
        description: true,
        isRecommended: true,
        isPremiumOnly: true,
        maxTokens: true,
        avgResponseTime: true,
        successRate: true,
        supportsImages: true,
        supportsCode: true,
        costPerRequest: true,
        icon: true,
      },
      orderBy: [{ isRecommended: "desc" }, { successRate: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: providers,
      defaultProviderId:
        providers.find((p: (typeof providers)[number]) => p.isRecommended)
          ?.id || providers[0]?.id,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
