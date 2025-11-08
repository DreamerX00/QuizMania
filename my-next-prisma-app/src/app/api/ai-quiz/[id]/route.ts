import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if quiz exists and belongs to user
    const quiz = await prisma.aIGeneratedQuiz.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: "Quiz not found" },
        { status: 404 }
      );
    }

    if (quiz.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You do not own this quiz" },
        { status: 403 }
      );
    }

    // Delete quiz (cascade will handle attempts)
    await prisma.aIGeneratedQuiz.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete quiz",
      },
      { status: 500 }
    );
  }
}
