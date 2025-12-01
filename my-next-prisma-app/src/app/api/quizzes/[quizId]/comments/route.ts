import { NextRequest, NextResponse } from "next/server";
import { QuizAttemptService } from "@/services/quizAttemptService";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 180; // 3 minutes cache for comments

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    // ✅ Extract quizId from URL path
    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split("/").slice(-2, -1)[0]; // /[quizId]/comments

    if (!quizId) {
      return new NextResponse("Quiz ID is required", { status: 400 });
    }

    const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // ✅ Extract query param for cursor
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    // ✅ Fetch paginated comments for quiz.id
    const comments = await prisma.quizComment.findMany({
      where: { quizId: quiz.id },
      take: PAGE_SIZE,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ Set nextCursor if more comments are available
    const nextCursor =
      comments.length === PAGE_SIZE ? comments[PAGE_SIZE - 1]?.id : null;

    return NextResponse.json({
      comments,
      nextCursor,
    });
  } catch (error) {
    console.error("[QUIZ_COMMENTS_PAGINATED]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
