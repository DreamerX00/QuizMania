import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Re-evaluation request API - Premium feature
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { attemptId, questionIds, reason } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });
    }

    // Check if user is premium
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accountType: true, premiumUntil: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPremium =
      user.accountType === "PREMIUM" || user.accountType === "LIFETIME";
    const isPremiumActive =
      isPremium &&
      (!user.premiumUntil || new Date(user.premiumUntil) > new Date());

    if (!isPremiumActive) {
      return NextResponse.json(
        { error: "Premium subscription required for re-evaluation" },
        { status: 403 }
      );
    }

    // Verify the attempt belongs to this user (QuizRecord)
    const record = await prisma.quizRecord.findFirst({
      where: {
        id: attemptId,
        userId: userId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            creatorId: true,
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Attempt not found or does not belong to user" },
        { status: 404 }
      );
    }

    if (!record.quiz.creatorId) {
      return NextResponse.json(
        { error: "Quiz has no creator to send re-evaluation request to" },
        { status: 400 }
      );
    }

    // Check if re-evaluation already requested
    const existingRequest = await prisma.reEvaluationRequest.findFirst({
      where: {
        attemptId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Re-evaluation already in progress for this attempt" },
        { status: 409 }
      );
    }

    // Create re-evaluation request
    const reEvalRequest = await prisma.reEvaluationRequest.create({
      data: {
        attemptId,
        userId,
        quizId: record.quiz.id,
        creatorId: record.quiz.creatorId,
        questionIds: questionIds || [],
        reason: reason || "General re-evaluation request",
        status: "PENDING",
      },
    });

    // Notify quiz creator (optional - you can implement notifications)
    // await notifyCreator(attempt.quiz.creatorId, reEvalRequest.id);

    return NextResponse.json({
      success: true,
      requestId: reEvalRequest.id,
      message: "Re-evaluation request submitted successfully",
    });
  } catch (error) {
    console.error("Re-evaluation request error:", error);
    return NextResponse.json(
      { error: "Failed to submit re-evaluation request" },
      { status: 500 }
    );
  }
}

// Get status of re-evaluation requests for an attempt
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });
    }

    const requests = await prisma.reEvaluationRequest.findMany({
      where: {
        attemptId,
        userId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      requests,
      hasPending: requests.some(
        (r: { status: string }) =>
          r.status === "PENDING" || r.status === "IN_PROGRESS"
      ),
    });
  } catch (error) {
    console.error("Get re-evaluation status error:", error);
    return NextResponse.json(
      { error: "Failed to get re-evaluation status" },
      { status: 500 }
    );
  }
}
