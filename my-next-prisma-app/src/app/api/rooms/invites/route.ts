import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { withBodyValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
// NO cache - real-time invites

// GET: List invites for the authenticated user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const invites = await prisma.roomInvite.findMany({
      where: { userId, status: "PENDING" },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ invites });
  } catch (error) {
    console.error("Error listing room invites:", error);
    return NextResponse.json(
      { error: "Failed to list room invites" },
      { status: 500 }
    );
  }
}

const inviteActionSchema = z.object({
  action: z.enum(["send", "accept", "decline"]),
  roomId: z.string().optional(),
  inviteeId: z.string().optional(),
  inviteId: z.string().optional(),
});

// POST: Send, accept, or decline an invite
export const POST = withBodyValidation(inviteActionSchema, async (request) => {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = currentUser;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { roomId, inviteeId, action, inviteId } = request.validatedBody!;
    if (action === "send") {
      // Only host can send
      if (!roomId || !inviteeId)
        return NextResponse.json(
          { error: "Room ID and invitee ID required" },
          { status: 400 }
        );
      const host = await prisma.roomMembership.findFirst({
        where: { roomId, userId, role: "HOST" },
      });
      if (!host)
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      const existing = await prisma.roomInvite.findFirst({
        where: { roomId, userId: inviteeId, status: "PENDING" },
      });
      if (existing)
        return NextResponse.json({ error: "Already invited" }, { status: 409 });
      const invite = await prisma.roomInvite.create({
        data: { roomId, userId: inviteeId, status: "PENDING" },
      });
      return NextResponse.json({ invite });
    } else if (action === "accept" || action === "decline") {
      if (!inviteId)
        return NextResponse.json(
          { error: "Invite ID required" },
          { status: 400 }
        );
      const invite = await prisma.roomInvite.findUnique({
        where: { id: inviteId },
      });
      if (!invite || invite.userId !== userId)
        return NextResponse.json(
          { error: "Invite not found" },
          { status: 404 }
        );
      if (action === "accept") {
        // Ensure user exists in the database
        await prisma.user.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            email: user.email || "unknown@example.com",
            name: user.name || "Unknown User",
            avatarUrl: user.avatarUrl || user.image,
          },
        });
        // Add to room
        await prisma.roomMembership.create({
          data: { roomId: invite.roomId, userId, role: "PLAYER" },
        });
      }
      const updated = await prisma.roomInvite.update({
        where: { id: inviteId },
        data: { status: action === "accept" ? "ACCEPTED" : "DECLINED" },
      });
      return NextResponse.json({ invite: updated });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error handling room invite:", error);
    return NextResponse.json(
      { error: "Failed to handle room invite" },
      { status: 500 }
    );
  }
});
