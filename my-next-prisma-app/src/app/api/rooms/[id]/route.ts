import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { withParamsValidation, z } from "@/lib/api-validation";

export const dynamic = "force-dynamic";
// NO cache - real-time room state

const roomParamsSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
});

export const GET = withParamsValidation(
  roomParamsSchema,
  async (request, _context) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { id: roomId } = request.validatedParams!;
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          memberships: { include: { user: true } },
          invites: true,
        },
      });
      if (!room)
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json({ room });
    } catch (error) {
      console.error("Error fetching room details:", error);
      return NextResponse.json(
        { error: "Failed to fetch room details" },
        { status: 500 }
      );
    }
  }
);
