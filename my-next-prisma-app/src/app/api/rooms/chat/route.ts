import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
// NO cache - real-time chat

// GET: Fetch recent chat messages for a room
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }
    // Only members can view
    const membership = await prisma.roomMembership.findFirst({
      where: { roomId, userId },
    });
    if (!membership) {
      return NextResponse.json({ error: "Not a room member" }, { status: 403 });
    }
    const messages = await prisma.roomChat.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Error fetching room chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch room chat" },
      { status: 500 }
    );
  }
}

// POST: Send a chat message
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { roomId, message } = await request.json();
    if (!roomId || !message) {
      return NextResponse.json(
        { error: "Room ID and message required" },
        { status: 400 }
      );
    }
    // Only members can send
    const membership = await prisma.roomMembership.findFirst({
      where: { roomId, userId },
    });
    if (!membership) {
      return NextResponse.json({ error: "Not a room member" }, { status: 403 });
    }
    const chat = await prisma.roomChat.create({
      data: { roomId, senderId: userId, message },
      include: { sender: true },
    });
    return NextResponse.json({ message: chat });
  } catch (error) {
    console.error("Error sending room chat message:", error);
    return NextResponse.json(
      { error: "Failed to send room chat message" },
      { status: 500 }
    );
  }
}
