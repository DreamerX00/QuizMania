// API Route: GET /api/ai-quiz/quota
// Get user's current quota status

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkQuota, formatResetTime } from "@/lib/ai-quiz/quota-manager";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quotaStatus = await checkQuota(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        ...quotaStatus,
        resetIn: formatResetTime(quotaStatus.resetAt),
      },
    });
  } catch (error) {
    console.error("Error fetching quota status:", error);
    return NextResponse.json(
      { error: "Failed to fetch quota status" },
      { status: 500 }
    );
  }
}
