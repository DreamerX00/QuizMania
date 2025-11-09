import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

const startSchema = z.object({
  fingerprint: z.string().optional(),
  deviceInfo: z.any().optional(),
  ip: z.string().optional(),
});

export const POST = withValidation(
  startSchema,
  async (
    request: NextRequest & { validated?: z.infer<typeof startSchema> },
    { params }: { params: Promise<{ quizId: string }> }
  ) => {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const body = request.validated as z.infer<typeof startSchema>;
    try {
      const res = await QuizAttemptService.startAttempt(
        userId,
        quizId,
        body?.fingerprint,
        body?.deviceInfo,
        body?.ip
      );
      return NextResponse.json(res);
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      if (error instanceof Error) {
        if (error.message.includes("Premium subscription required")) {
          return NextResponse.json(
            {
              error: "Premium subscription required for this quiz",
              requiresPremium: true,
            },
            { status: 403 }
          );
        }
        if (error.message.includes("Daily attempt limit reached")) {
          return NextResponse.json(
            { error: error.message, limitReached: true },
            { status: 429 }
          );
        }
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
