// API Route: GET /api/ai-quiz/providers
// List all available AI providers

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AI_PROVIDERS } from "@/constants/ai-quiz";
import { isProviderAvailable } from "@/lib/ai-quiz/providers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter providers that are active and have API keys configured
    const availableProviders = AI_PROVIDERS.filter(
      (provider) => provider.isActive && isProviderAvailable(provider.id)
    ).map((provider) => ({
      id: provider.id,
      name: provider.name,
      model: provider.model,
      type: provider.type,
      icon: provider.icon,
      description: provider.description,
      avgTime: provider.avgTime,
      successRate: provider.successRate,
      features: provider.features,
      isRecommended: provider.isRecommended,
    }));

    return NextResponse.json({
      success: true,
      data: availableProviders,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
