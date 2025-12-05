import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/db/index";
import { withParamsValidation, z } from "@/lib/api-validation";

const paramsSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
});

export const POST = withParamsValidation(
  paramsSchema,
  async (request, _context) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id: roomId } = request.validatedParams!;

      // Verify room exists
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!room) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      // Verify user is the host
      const hostMember = room.memberships.find((m) => m.role === "HOST");
      if (!hostMember || hostMember.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Only the host can start the match" },
          { status: 403 }
        );
      }

      // Check minimum players (at least 2)
      if (room.memberships.length < 2) {
        return NextResponse.json(
          { error: "At least 2 players required to start the match" },
          { status: 400 }
        );
      }

      // Check if room is already in progress or finished
      if (room.status === "IN_PROGRESS" || room.status === "FINISHED") {
        return NextResponse.json(
          { error: `Room is already ${room.status.toLowerCase()}` },
          { status: 400 }
        );
      }

      // Update room status to IN_PROGRESS
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
        include: {
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      // ✅ DATABASE UPDATED - Client must emit WebSocket event after receiving this response:
      // socketService.emit('game:start', { roomId, mode: room.gameMode });
      // The WebSocket server (ws-server/events/gameEvents.ts) will broadcast 'game:started' to all room members

      return NextResponse.json({
        success: true,
        room: {
          id: updatedRoom.id,
          name: updatedRoom.name,
          status: updatedRoom.status,
          startedAt: updatedRoom.startedAt,
          members: updatedRoom.memberships.map((m) => ({
            userId: m.userId,
            role: m.role,
            name: m.user.name,
          })),
        },
      });
    } catch (error) {
      console.error("Error starting match:", error);
      return NextResponse.json(
        { error: "Failed to start match" },
        { status: 500 }
      );
    }
  }
);
