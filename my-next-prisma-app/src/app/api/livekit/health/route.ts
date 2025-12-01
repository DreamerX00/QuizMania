import { NextRequest, NextResponse } from "next/server";
import { liveKitService } from "@/lib/livekit";
import { webrtcFallbackService } from "@/services/webrtcFallbackService";

export const dynamic = "force-dynamic";
// NO cache - health checks need fresh status

export async function GET(_request: NextRequest) {
  try {
    const healthStatus = liveKitService.getHealthStatus();
    const webrtcStats = webrtcFallbackService.getRoomStats();

    // Check if LiveKit is healthy
    const isHealthy = healthStatus.isHealthy && !healthStatus.fallbackActive;

    const response = {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      livekit: {
        ...healthStatus,
        isHealthy: healthStatus.isHealthy,
        fallbackActive: healthStatus.fallbackActive,
      },
      webrtc: {
        activeRooms: webrtcStats.length,
        totalPeers: webrtcStats.reduce((sum, room) => sum + room.peerCount, 0),
        rooms: webrtcStats,
      },
      overall: {
        voiceSystem: isHealthy ? "livekit" : "webrtc-fallback",
        uptime: Date.now() - healthStatus.lastCheck.getTime(),
      },
    };

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error("LiveKit health check error:", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Force fallback mode (for testing/admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "force-fallback":
        liveKitService.forceFallback();
        return NextResponse.json({
          success: true,
          message: "LiveKit fallback mode forced",
          status: liveKitService.getHealthStatus(),
        });

      case "reset-fallback":
        liveKitService.resetFallback();
        return NextResponse.json({
          success: true,
          message: "LiveKit fallback mode reset",
          status: liveKitService.getHealthStatus(),
        });

      case "cleanup-webrtc":
        webrtcFallbackService.forceCleanup();
        return NextResponse.json({
          success: true,
          message: "WebRTC rooms cleaned up",
          stats: webrtcFallbackService.getRoomStats(),
        });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use: force-fallback, reset-fallback, or cleanup-webrtc",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("LiveKit admin action error:", error);

    return NextResponse.json({ error: "Admin action failed" }, { status: 500 });
  }
}
