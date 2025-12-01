import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
// NO cache - real-time friend chat

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const friendId = searchParams.get("friendId");
  if (!friendId)
    return NextResponse.json({ error: "Missing friendId" }, { status: 400 });
  const messages = await prisma.friendChat.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { friendId, message } = await req.json();
  if (!friendId || !message)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const chat = await prisma.friendChat.create({
    data: { senderId: userId, receiverId: friendId, message },
  });
  return NextResponse.json({ chat });
}
