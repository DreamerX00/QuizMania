import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

export const dynamic = "force-dynamic";
export const revalidate = 180; // 3 minutes cache for public chat history

export async function GET() {
  const messages = await prisma.publicChat.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ messages: messages.reverse() });
}

const publicChatSchema = z.object({
  message: z.string().min(1).max(1000),
});

export const POST = withValidation(publicChatSchema, async (req) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { message } = req.validated;
  const chat = await prisma.publicChat.create({
    data: { senderId: userId, message },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json({ chat });
});
