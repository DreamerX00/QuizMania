import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

const submitArenaSchema = z.object({
  quizRecordId: z.string().min(1),
  answers: z.array(z.unknown()),
  duration: z.number().min(0),
  status: z.string().min(1),
});

export const POST = withValidation(submitArenaSchema, async (request) => {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { quizRecordId, answers, duration, status } = request.validated;
    // Submit the attempt with per-question answers
    const result = await QuizAttemptService.submitArenaAttempt(
      userId,
      quizRecordId,
      answers,
      duration,
      status
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error submitting multiplayer arena attempt:", error);
    return NextResponse.json(
      { error: "Failed to submit multiplayer arena attempt" },
      { status: 500 }
    );
  }
});
