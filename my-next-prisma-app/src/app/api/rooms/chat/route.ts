import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import {
  withBodyValidation,
  withQueryValidation,
  z,
} from "@/lib/api-validation";

export const dynamic = "force-dynamic";
// NO cache - real-time chat

const getChatSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});

// GET: Fetch recent chat messages for a room
export const GET = withQueryValidation(getChatSchema, async (request) => {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { roomId } = request.validatedQuery!;
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
});

const sendChatSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  message: z.string().min(1, "Message is required").max(1000),
});

// POST: Send a chat message
export const POST = withBodyValidation(sendChatSchema, async (request) => {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { roomId, message } = request.validatedBody!;
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
});
