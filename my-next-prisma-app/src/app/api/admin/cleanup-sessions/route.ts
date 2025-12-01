import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Cron job to clean up expired sessions
 * Runs daily at 2:00 AM UTC via Vercel Cron
 */
export async function GET() {
  try {
    // Verify request is from Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Delete expired sessions
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedSessions: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session cleanup cron error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
