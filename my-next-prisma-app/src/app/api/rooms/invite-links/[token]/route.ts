import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { withParamsValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

const tokenParamsSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// GET: Validate an invite token and return room information
export const GET = withParamsValidation(
  tokenParamsSchema,
  async (request, _context) => {
    try {
      const { token } = request.validatedParams!;

      // Find the invite link
      const inviteLink = await prisma.roomInviteLink.findUnique({
        where: { token },
        include: {
          room: {
            include: {
              memberships: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              image: true,
            },
          },
        },
      });

      if (!inviteLink) {
        return NextResponse.json(
          { error: "Invite link not found" },
          { status: 404 }
        );
      }

      // Check if link is valid
      if (!inviteLink.isActive) {
        return NextResponse.json(
          { error: "This invite link has been deactivated" },
          { status: 410 } // Gone
        );
      }

      if (inviteLink.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "This invite link has expired" },
          { status: 410 }
        );
      }

      if (
        inviteLink.maxUses !== null &&
        inviteLink.usedCount >= inviteLink.maxUses
      ) {
        return NextResponse.json(
          { error: "This invite link has reached its maximum uses" },
          { status: 410 }
        );
      }

      // Check if room is full
      if (
        inviteLink.room.memberships.length >= inviteLink.room.maxParticipants
      ) {
        return NextResponse.json(
          { error: "This room is full" },
          { status: 409 } // Conflict
        );
      }

      return NextResponse.json({
        valid: true,
        room: {
          id: inviteLink.room.id,
          name: inviteLink.room.name,
          code: inviteLink.room.code,
          type: inviteLink.room.type,
          maxParticipants: inviteLink.room.maxParticipants,
          currentParticipants: inviteLink.room.memberships.length,
          isLocked: inviteLink.room.isLocked,
          status: inviteLink.room.status,
        },
        creator: inviteLink.creator,
        expiresAt: inviteLink.expiresAt,
      });
    } catch (error) {
      console.error("Error validating invite token:", error);
      return NextResponse.json(
        { error: "Failed to validate invite link" },
        { status: 500 }
      );
    }
  }
);

// POST: Join a room using an invite token
export const POST = withParamsValidation(
  tokenParamsSchema,
  async (request, _context) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { token } = request.validatedParams!;

      // Find and validate the invite link
      const inviteLink = await prisma.roomInviteLink.findUnique({
        where: { token },
        include: {
          room: {
            include: {
              memberships: true,
            },
          },
        },
      });

      if (!inviteLink) {
        return NextResponse.json(
          { error: "Invite link not found" },
          { status: 404 }
        );
      }

      // Validation checks
      if (!inviteLink.isActive) {
        return NextResponse.json(
          { error: "This invite link has been deactivated" },
          { status: 410 }
        );
      }

      if (inviteLink.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "This invite link has expired" },
          { status: 410 }
        );
      }

      if (
        inviteLink.maxUses !== null &&
        inviteLink.usedCount >= inviteLink.maxUses
      ) {
        return NextResponse.json(
          { error: "This invite link has reached its maximum uses" },
          { status: 410 }
        );
      }

      if (
        inviteLink.room.memberships.length >= inviteLink.room.maxParticipants
      ) {
        return NextResponse.json(
          { error: "This room is full" },
          { status: 409 }
        );
      }

      // Check if user is already a member
      const existingMembership = await prisma.roomMembership.findUnique({
        where: {
          userId_roomId: {
            userId,
            roomId: inviteLink.roomId,
          },
        },
      });

      if (existingMembership) {
        // Already a member, just return success
        return NextResponse.json({
          success: true,
          alreadyMember: true,
          roomId: inviteLink.roomId,
        });
      }

      // Use transaction to ensure user exists and join room
      const result = await prisma.$transaction(async (tx) => {
        // Ensure user exists in database
        const user = currentUser;
        await tx.user.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            email: user?.email || "unknown@example.com",
            name: user?.name || "Unknown User",
            avatarUrl: user?.avatarUrl || user?.image,
          },
        });

        // Add user to room
        const membership = await tx.roomMembership.create({
          data: {
            userId,
            roomId: inviteLink.roomId,
            role: "PLAYER",
          },
        });

        // Increment the used count
        await tx.roomInviteLink.update({
          where: { id: inviteLink.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });

        return membership;
      });

      return NextResponse.json({
        success: true,
        alreadyMember: false,
        roomId: inviteLink.roomId,
        membership: result,
      });
    } catch (error) {
      console.error("Error joining room via invite:", error);
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 }
      );
    }
  }
);
