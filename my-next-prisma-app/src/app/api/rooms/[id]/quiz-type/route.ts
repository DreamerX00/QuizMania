import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

const quizTypeSchema = z.object({
  quizType: z.string().min(1).max(50),
});

export const PATCH = withValidation(
  quizTypeSchema,
  async (request: any, { params }: { params: { id: string } }) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { quizType } = request.validated;
      const { id: roomId } = params;
      // Check if user is host of the room
      const membership = await prisma.roomMembership.findFirst({
        where: { roomId, userId, role: "HOST" },
      });
      if (!membership) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
      // Update room quiz type
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { quizType },
      });
      return NextResponse.json({ room: updatedRoom });
    } catch (error) {
      console.error("Error updating quiz type:", error);
      return NextResponse.json(
        { error: "Failed to update quiz type" },
        { status: 500 }
      );
    }
  }
);
