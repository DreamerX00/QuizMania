import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/lib/session';
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id: roomId } = params;

    // Check if user is host of the room
    const membership = await prisma.roomMembership.findFirst({
      where: { roomId, userId, role: "HOST" },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Check if room has enough players (at least 2)
    const playerCount = await prisma.roomMembership.count({
      where: { roomId },
    });

    if (playerCount < 2) {
      return NextResponse.json(
        { error: "Need at least 2 players to start" },
        { status: 400 }
      );
    }

    // Update room status to started
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        status: "STARTED",
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error("Error starting match:", error);
    return NextResponse.json(
      { error: "Failed to start match" },
      { status: 500 }
    );
  }
}
