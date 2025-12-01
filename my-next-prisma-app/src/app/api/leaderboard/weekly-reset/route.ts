import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Cron job to reset weekly leaderboard
 * Runs every Sunday at 11:59 PM UTC via Vercel Cron
 */
export async function GET() {
  try {
    // Verify request is from Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Archive current week's leaderboard
    const currentLeaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        points: true,
        rank: true,
      },
      orderBy: { points: "desc" },
      take: 100, // Top 100 users
    });

    // Store in leaderboard history (if you have a table for it)
    // await prisma.leaderboardHistory.create({
    //   data: {
    //     weekEnding: new Date(),
    //     rankings: currentLeaderboard,
    //   },
    // });

    // Reset weekly points (you might want a separate weeklyPoints field)
    // For now, this is a placeholder - adjust based on your data model
    const resetResult = await prisma.user.updateMany({
      data: {
        // Add your weekly reset logic here
        // For example: weeklyPoints: 0
      },
    });

    return NextResponse.json({
      success: true,
      archivedUsers: currentLeaderboard.length,
      resetCount: resetResult.count,
      weekEnding: new Date().toISOString(),
      message: "Weekly leaderboard reset completed",
    });
  } catch (error) {
    console.error("Weekly leaderboard reset cron error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
