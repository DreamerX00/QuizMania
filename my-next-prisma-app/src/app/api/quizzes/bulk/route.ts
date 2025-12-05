import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";
import { withQueryValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
export const revalidate = 180; // 3 minutes cache

interface QuizBulkResponse {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  isPublished: boolean;
  slug: string | null;
}

const bulkQuerySchema = z.object({
  ids: z.string().min(1, "Quiz IDs are required"),
});

export const GET = withQueryValidation(bulkQuerySchema, async (req) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId) return NextResponse.json([], { status: 401 });
  const { ids: idsParam } = req.validatedQuery!;
  const ids = idsParam.split(",").filter(Boolean);
  if (ids.length === 0) return NextResponse.json([]);
  const quizzes: QuizBulkResponse[] = [];
  for (const id of ids) {
    try {
      const quiz = await QuizAttemptService.resolveQuizIdentifier(id);
      if (quiz && quiz.creatorId === userId) {
        quizzes.push({
          id: quiz.id,
          title: quiz.title,
          imageUrl: quiz.imageUrl,
          description: quiz.description,
          isPublished: quiz.isPublished,
          slug: quiz.slug,
        });
      }
    } catch (error) {
      // Skip invalid quiz IDs
      console.error(`Failed to resolve quiz ${id}:`, error);
    }
  }
  return NextResponse.json(quizzes);
});
