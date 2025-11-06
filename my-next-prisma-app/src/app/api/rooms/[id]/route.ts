import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from '@/lib/session';
import prisma from "@/lib/prisma";

export async function GET(
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
    const roomId = params.id;
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        memberships: { include: { user: true } },
        invites: true,
      },
    });
    if (!room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    return NextResponse.json({ room });
  } catch (error) {
    console.error("Error fetching room details:", error);
    return NextResponse.json(
      { error: "Failed to fetch room details" },
      { status: 500 }
    );
  }
}
