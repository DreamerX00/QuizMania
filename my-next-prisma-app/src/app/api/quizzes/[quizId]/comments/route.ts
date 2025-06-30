import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    // ✅ Extract quizId from URL path
    const pathname = request.nextUrl.pathname;
    const quizId = pathname.split('/').slice(-2, -1)[0]; // /[quizId]/comments

    if (!quizId) {
      return new NextResponse('Quiz ID is required', { status: 400 });
    }

    // ✅ Extract query param for cursor
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');

    // ✅ Fetch paginated comments
    const comments = await prisma.quizComment.findMany({
      where: { quizId },
      take: PAGE_SIZE,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ✅ Set nextCursor if more comments are available
    const nextCursor = comments.length === PAGE_SIZE ? comments[PAGE_SIZE - 1].id : null;

    return NextResponse.json({
      comments,
      nextCursor,
    });
  } catch (error) {
    console.error('[QUIZ_COMMENTS_PAGINATED]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
