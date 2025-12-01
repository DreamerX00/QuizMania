import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
// NO cache - real-time party chat

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  if (!roomId)
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  const messages = await prisma.roomChat.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { roomId, message } = await req.json();
  if (!roomId || !message)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  // TODO: Check user is in room
  const chat = await prisma.roomChat.create({
    data: { roomId, senderId: userId, message },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ chat });
}
