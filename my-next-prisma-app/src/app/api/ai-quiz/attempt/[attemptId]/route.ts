import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const UpdateAttemptSchema = z.object({
  answers: z.record(z.string(), z.string()).optional(),
  timeRemaining: z.number().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = params;

    // Fetch attempt to verify ownership
    const attempt = await prisma.aIQuizAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true, status: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Verify user owns this attempt
    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can only update in-progress attempts
    if (attempt.status !== "in-progress") {
      return NextResponse.json(
        { error: "Cannot update completed attempt" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = UpdateAttemptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { answers, timeRemaining } = validation.data;

    // Update attempt
    const updatedAttempt = await prisma.aIQuizAttempt.update({
      where: { id: attemptId },
      data: {
        ...(answers && { answers }),
        ...(timeRemaining !== undefined && { totalTimeSpent: timeRemaining }),
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: updatedAttempt.id,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating attempt:", error);
    return NextResponse.json(
      { error: "Failed to update attempt" },
      { status: 500 }
    );
  }
}
