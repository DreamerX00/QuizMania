import { NextRequest, NextResponse } from "next/server";
import { liveKitService } from "@/lib/livekit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roomName, options } = body;

    if (!userId || !roomName) {
      return NextResponse.json(
        { error: "Missing userId or roomName" },
        { status: 400 }
      );
    }

    // Check if LiveKit is available
    if (liveKitService.isFallbackActive()) {
      return NextResponse.json(
        {
          error: "LiveKit is currently unavailable, using WebRTC fallback",
          fallback: true,
        },
        { status: 503 }
      );
    }

    // Generate LiveKit token
    const token = await liveKitService.generateToken(userId, roomName, options);

    return NextResponse.json({
      token,
      roomName,
      mode: "livekit",
    });
  } catch (error) {
    console.error("LiveKit token generation error:", error);

    // If LiveKit fails, return fallback response
    return NextResponse.json(
      {
        error: "LiveKit token generation failed, using WebRTC fallback",
        fallback: true,
      },
      { status: 503 }
    );
  }
}
