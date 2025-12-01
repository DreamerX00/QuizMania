// API Route: Check AI Provider Availability
// Returns which providers have valid API keys configured

import { NextResponse } from "next/server";
import { isProviderAvailable } from "@/lib/ai-quiz/providers";
import { AI_PROVIDERS } from "@/constants/ai-quiz";

export const dynamic = "force-dynamic";
export const revalidate = 600; // 10 minutes cache

interface ProviderStatus {
  available: boolean;
  reason: string | null;
}

export async function GET() {
  try {
    const availability: Record<string, ProviderStatus> = {};

    // Check each provider's availability
    for (const provider of AI_PROVIDERS) {
      const isAvailable = isProviderAvailable(provider.id);
      availability[provider.id] = {
        available: isAvailable,
        reason: isAvailable ? null : "API key not configured",
      };
    }

    return NextResponse.json({
      success: true,
      data: availability,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking provider availability:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check provider availability",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
