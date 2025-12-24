import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Start a chat with quiz creator - Premium feature
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { quizId, message } = body;

    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    // Check if user is premium
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accountType: true, premiumUntil: true, name: true },
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
        { error: "Premium subscription required to chat with quiz creators" },
        { status: 403 }
      );
    }

    // Get quiz and creator
    const quiz = await prisma.quiz.findFirst({
      where: {
        OR: [{ id: quizId }, { slug: quizId }],
      },
      select: {
        id: true,
        title: true,
        creatorId: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (!quiz.creatorId || !quiz.creator) {
      return NextResponse.json(
        { error: "Quiz has no creator to chat with" },
        { status: 400 }
      );
    }

    if (quiz.creatorId === userId) {
      return NextResponse.json(
        { error: "You cannot chat with yourself" },
        { status: 400 }
      );
    }

    // If message provided, send it
    if (message && message.trim()) {
      const chat = await prisma.friendChat.create({
        data: {
          senderId: userId,
          receiverId: quiz.creatorId,
          message: `[Regarding Quiz: ${quiz.title}]\n${message.trim()}`,
        },
      });

      return NextResponse.json({
        success: true,
        chatId: chat.id,
        creator: quiz.creator,
        quizTitle: quiz.title,
      });
    }

    // Return creator info for chat initiation
    return NextResponse.json({
      success: true,
      creator: quiz.creator,
      quizTitle: quiz.title,
      canChat: true,
    });
  } catch (error) {
    console.error("Chat with creator error:", error);
    return NextResponse.json(
      { error: "Failed to initiate chat" },
      { status: 500 }
    );
  }
}

// Get chat history with a quiz creator
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    // Get quiz creator
    const quiz = await prisma.quiz.findFirst({
      where: {
        OR: [{ id: quizId }, { slug: quizId }],
      },
      select: {
        id: true,
        title: true,
        creatorId: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!quiz || !quiz.creatorId) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get chat history between user and creator
    const messages = await prisma.friendChat.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: quiz.creatorId },
          { senderId: quiz.creatorId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({
      messages: messages.reverse(),
      creator: quiz.creator,
      quizTitle: quiz.title,
    });
  } catch (error) {
    console.error("Get creator chat error:", error);
    return NextResponse.json(
      { error: "Failed to get chat history" },
      { status: 500 }
    );
  }
}
