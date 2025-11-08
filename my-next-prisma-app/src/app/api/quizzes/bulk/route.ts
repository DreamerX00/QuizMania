import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { QuizAttemptService } from "@/services/quizAttemptService";

interface QuizBulkResponse {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  isPublished: boolean;
  slug: string | null;
}

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId) return NextResponse.json([], { status: 401 });
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) return NextResponse.json([]);
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
}
