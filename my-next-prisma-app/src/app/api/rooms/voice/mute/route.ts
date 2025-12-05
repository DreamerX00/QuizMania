import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { withBodyValidation, z } from "@/lib/api-validation";

const muteSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  playerId: z.string().min(1, "Player ID is required"),
  muted: z.boolean(),
});

export const POST = withBodyValidation(muteSchema, async (request) => {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      roomId: _roomId,
      playerId: _playerId,
      muted,
    } = request.validatedBody!;

    // ⚠️ DEPRECATED: This API endpoint is not needed for voice mute functionality.
    // Voice muting should be handled directly via WebSocket for real-time communication.
    //
    // ✅ CORRECT USAGE (Client-side):
    // import { socketService } from '@/lib/socket';
    // socketService.muteVoice(roomId, muted);
    //
    // This will emit 'voice:mute' to the WebSocket server (ws-server/events/voiceEvents.ts),
    // which broadcasts 'voice:user-muted' to all room members in real-time.
    //
    // This endpoint exists for backward compatibility but does nothing.

    return NextResponse.json({
      success: true,
      message: `Player ${muted ? "muted" : "unmuted"} successfully`,
      deprecated: true,
      instructions:
        "Use socketService.muteVoice(roomId, muted) for real-time voice control",
    });
  } catch (error) {
    console.error("Error updating voice mute status:", error);
    return NextResponse.json(
      { error: "Failed to update voice mute status" },
      { status: 500 }
    );
  }
});
