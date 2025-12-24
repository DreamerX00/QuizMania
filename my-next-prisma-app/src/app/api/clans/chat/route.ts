import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
// NO cache - real-time clan chat

// GET: Fetch recent chat messages for a clan
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clanId = searchParams.get("clanId");
  if (!clanId)
    return NextResponse.json({ error: "Missing clanId" }, { status: 400 });
  const messages = await prisma.clanChat.findMany({
    where: { clanId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ messages });
}

// POST: Send a chat message
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { clanId, message } = await req.json();
  if (!clanId || !message)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Check user is a member of the clan
  const membership = await prisma.clanMembership.findUnique({
    where: {
      odId_clanId: {
        odId: userId,
        clanId: clanId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "You must be a clan member to send messages" },
      { status: 403 }
    );
  }

  const chat = await prisma.clanChat.create({
    data: { clanId, senderId: userId, message },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ chat });
}
