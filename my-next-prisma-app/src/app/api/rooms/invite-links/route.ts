import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import {
  withBodyValidation,
  withQueryValidation,
  z,
} from "@/lib/api-validation";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const createInviteLinkSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  expiresInHours: z.number().min(1).max(168).default(24), // Max 1 week
  maxUses: z.number().min(1).nullable().optional(),
});

// POST: Create a new invite link for a room
export const POST = withBodyValidation(
  createInviteLinkSchema,
  async (request) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { roomId, expiresInHours, maxUses } = request.validatedBody!;

      // Verify room exists and user is a member (preferably host)
      const membership = await prisma.roomMembership.findFirst({
        where: { roomId, userId },
        include: { room: true },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Room not found or you are not a member" },
          { status: 404 }
        );
      }

      // Generate unique token
      const token = nanoid(10); // Generates URL-safe token like "V1StGXR8_Z"

      // Calculate expiration
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      // Create invite link
      const inviteLink = await prisma.roomInviteLink.create({
        data: {
          roomId,
          token,
          createdBy: userId,
          expiresAt,
          maxUses: maxUses || null, // null = unlimited
        },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              code: true,
              maxParticipants: true,
            },
          },
        },
      });

      // Generate the full invite URL
      const baseUrl = env.NEXT_PUBLIC_APP_URL || env.NEXTAUTH_URL || "";
      const inviteUrl = `${baseUrl}/invite/${token}`;

      return NextResponse.json({
        inviteLink: {
          ...inviteLink,
          url: inviteUrl,
        },
      });
    } catch (error) {
      console.error("Error creating invite link:", error);
      return NextResponse.json(
        { error: "Failed to create invite link" },
        { status: 500 }
      );
    }
  }
);

const getInviteLinksSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});

// GET: List all active invite links for a room
export const GET = withQueryValidation(
  getInviteLinksSchema,
  async (request) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const roomId = searchParams.get("roomId");

      if (!roomId) {
        return NextResponse.json(
          { error: "Room ID is required" },
          { status: 400 }
        );
      }

      // Verify user is a member of the room
      const membership = await prisma.roomMembership.findFirst({
        where: { roomId, userId },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Room not found or you are not a member" },
          { status: 404 }
        );
      }

      // Get all active invite links
      const inviteLinks = await prisma.roomInviteLink.findMany({
        where: {
          roomId,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
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

      // Generate full URLs for each link
      const baseUrl = env.NEXT_PUBLIC_APP_URL || env.NEXTAUTH_URL || "";
      const linksWithUrls = inviteLinks.map(
        (link: (typeof inviteLinks)[number]) => ({
          ...link,
          url: `${baseUrl}/invite/${link.token}`,
        })
      );

      return NextResponse.json({ inviteLinks: linksWithUrls });
    } catch (error) {
      console.error("Error fetching invite links:", error);
      return NextResponse.json(
        { error: "Failed to fetch invite links" },
        { status: 500 }
      );
    }
  }
);

const deleteInviteLinkSchema = z.object({
  linkId: z.string().min(1, "Link ID is required"),
});

// DELETE: Deactivate an invite link
export const DELETE = withQueryValidation(
  deleteInviteLinkSchema,
  async (request) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { linkId } = request.validatedQuery!;

      if (!linkId) {
        return NextResponse.json(
          { error: "Link ID is required" },
          { status: 400 }
        );
      }

      // Get the invite link
      const inviteLink = await prisma.roomInviteLink.findUnique({
        where: { id: linkId },
        include: {
          room: {
            include: {
              memberships: {
                where: { userId },
              },
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

      // Check if user is the creator or a host of the room
      const isCreator = inviteLink.createdBy === userId;
      const isHost = inviteLink.room.memberships.some(
        (m: (typeof inviteLink.room.memberships)[number]) =>
          m.userId === userId && m.role === "HOST"
      );

      if (!isCreator && !isHost) {
        return NextResponse.json(
          { error: "Not authorized to delete this invite link" },
          { status: 403 }
        );
      }

      // Deactivate the link (soft delete)
      await prisma.roomInviteLink.update({
        where: { id: linkId },
        data: { isActive: false },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting invite link:", error);
      return NextResponse.json(
        { error: "Failed to delete invite link" },
        { status: 500 }
      );
    }
  }
);
