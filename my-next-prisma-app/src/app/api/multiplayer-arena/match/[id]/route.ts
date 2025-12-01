import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await context.params;
    const matchId = params.id;
    if (!matchId) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }
    const record = await prisma.quizRecord.findUnique({
      where: { id: matchId, userId },
      include: {
        questionRecords: true,
        quiz: { select: { title: true, id: true } },
      },
    });
    if (!record) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: record.id,
      quizId: record.quizId,
      quizTitle: record.quiz?.title || "",
      dateTaken: record.dateTaken,
      score: record.score,
      duration: record.duration,
      earnedPoints: record.earnedPoints,
      status: record.status,
      questions: record.questionRecords,
    });
  } catch (error) {
    console.error("Error fetching match details:", error);
    return NextResponse.json(
      { error: "Failed to fetch match details" },
      { status: 500 }
    );
  }
}
