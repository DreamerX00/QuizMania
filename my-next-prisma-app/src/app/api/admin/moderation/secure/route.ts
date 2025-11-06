import { NextResponse } from "next/server";
import { requireAdmin, rateLimit, logAdminAction } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  // Require admin authentication
  const { user: admin, error } = await requireAdmin();
  if (error) return error;
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limiting - 10 actions per minute
  if (!rateLimit(admin.id, 10, 60000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { action, userId, roomId, targetId, blockedId, reason } = body;

    // Validate required fields
    if (
      !action ||
      !["mute", "unmute", "block", "unblock", "report"].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    let result;
    const actionDetails = {
      action,
      userId,
      roomId,
      targetId,
      blockedId,
      reason,
    };

    switch (action) {
      case "mute":
      case "unmute":
        if (!userId || !roomId) {
          return NextResponse.json(
            { error: "userId and roomId required for mute/unmute" },
            { status: 400 }
          );
        }

        // Implement mute/unmute logic
        result = await prisma.moderationAction.create({
          data: {
            action,
            type: action.toUpperCase(),
            targetUserId: userId,
            performedById: admin.id,
            moderatorId: admin.id,
            roomId,
            reason: reason || "Admin action",
            expiresAt:
              action === "mute"
                ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                : null, // 24 hours
          },
        });
        break;

      case "block":
      case "unblock":
        if (!userId || !blockedId) {
          return NextResponse.json(
            { error: "userId and blockedId required for block/unblock" },
            { status: 400 }
          );
        }

        if (action === "block") {
          result = await prisma.userBlock.create({
            data: {
              blockerId: userId,
              blockedId: blockedId,
              userId,
              blockedUserId: blockedId,
              blockedBy: admin.id,
              reason: reason || "Admin action",
            },
          });
        } else {
          result = await prisma.userBlock.deleteMany({
            where: {
              blockerId: userId,
              blockedId: blockedId,
            },
          });
        }
        break;

      case "report":
        if (!targetId) {
          return NextResponse.json(
            { error: "targetId required for report" },
            { status: 400 }
          );
        }

        result = await prisma.userReport.create({
          data: {
            reporterId: admin.id,
            reportedUserId: targetId,
            reason: reason || "Admin report",
            status: "PENDING",
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Log the admin action for audit trail
    await logAdminAction(
      admin.id,
      action,
      userId || targetId,
      actionDetails
    );

    return NextResponse.json({
      success: true,
      action,
      result,
      moderator: admin.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Moderation action error:", error);

    // Log failed action attempt
    await logAdminAction(admin.id, "FAILED_ACTION", undefined, {
      error: String(error),
    });

    return NextResponse.json(
      { error: "Failed to perform moderation action" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Require admin authentication for viewing logs
  const { user: admin, error } = await requireAdmin();
  if (error) return error;
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get recent moderation actions
    const logs = await prisma.moderationAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        targetUser: {
          select: { name: true, email: true },
        },
        moderator: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((log) => ({
        id: log.id,
        type: log.type,
        targetUser: log.targetUser?.name || "Unknown",
        moderator: log.moderator?.name || "System",
        reason: log.reason,
        roomId: log.roomId,
        createdAt: log.createdAt,
        expiresAt: log.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch moderation logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
