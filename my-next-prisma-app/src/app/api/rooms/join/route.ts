import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { withBodyValidation, z } from "@/lib/api-validation";

const joinRoomSchema = z.object({
  code: z.string().min(1, "Room code is required").toUpperCase(),
});

// POST: Join a room by code
export const POST = withBodyValidation(joinRoomSchema, async (request) => {
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

    const { code } = request.validatedBody!;

    // Find room by code
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: { memberships: { include: { user: true } } },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.roomMembership.findFirst({
      where: { roomId: room.id, userId },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this room" },
        { status: 409 }
      );
    }

    // Check if room is full
    if (room.memberships.length >= room.maxParticipants) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

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

    // Join the room
    const membership = await prisma.roomMembership.create({
      data: {
        roomId: room.id,
        userId,
        role: "PLAYER",
      },
      include: { user: true },
    });

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        code: room.code,
        type: room.type,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt,
      },
      membership,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
});
