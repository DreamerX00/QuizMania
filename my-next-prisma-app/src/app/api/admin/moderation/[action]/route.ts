import { NextResponse } from "next/server";
import {
  muteUser,
  unmuteUser,
  blockUser,
  unblockUser,
  reportUser,
} from "@/services/moderationService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";
import { NextRequest } from "next/server";
import { requireAdmin, rateLimit, logAdminAction } from "@/lib/adminAuth";

const moderationSchema = z.object({
  action: z.string().min(1),
  roomId: z.string().optional(),
  userId: z.string().optional(),
  byId: z.string().optional(),
  reason: z.string().optional(),
  blockedId: z.string().optional(),
  targetId: z.string().optional(),
  context: z.any().optional(),
});

type ModerationRequest = {
  action: string;
  roomId?: string;
  userId?: string;
  byId?: string;
  reason?: string;
  blockedId?: string;
  targetId?: string;
  context?: unknown;
};

// SECURITY: Admin authentication required

export const POST = withValidation(
  moderationSchema,
  async (request: NextRequest) => {
    // Require admin authentication
    const { user: admin, error } = await requireAdmin();
    if (error) return error;
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting - 20 actions per minute for admin
    if (!rateLimit(admin.id, 20, 60000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const { action, roomId, userId, reason, blockedId, targetId, context } = (
      request as { validated: ModerationRequest }
    ).validated;

    try {
      if (action === "mute") {
        if (!roomId || !userId)
          return NextResponse.json(
            { error: "Missing required fields for mute" },
            { status: 400 }
          );
        await muteUser(roomId, userId, admin.id, reason);
        await logAdminAction(admin.id, "mute", userId, { roomId, reason });
        return NextResponse.json({ success: true, moderator: admin.name });
      }
      if (action === "unmute") {
        if (!roomId || !userId)
          return NextResponse.json(
            { error: "Missing required fields for unmute" },
            { status: 400 }
          );
        await unmuteUser(roomId, userId, admin.id, reason);
        await logAdminAction(admin.id, "unmute", userId, { roomId, reason });
        return NextResponse.json({ success: true, moderator: admin.name });
      }
      if (action === "block") {
        if (!userId || !blockedId)
          return NextResponse.json(
            { error: "Missing required fields for block" },
            { status: 400 }
          );
        await blockUser(userId, blockedId, admin.id, reason);
        await logAdminAction(admin.id, "block", userId, { blockedId, reason });
        return NextResponse.json({ success: true, moderator: admin.name });
      }
      if (action === "unblock") {
        if (!userId || !blockedId)
          return NextResponse.json(
            { error: "Missing required fields for unblock" },
            { status: 400 }
          );
        await unblockUser(userId, blockedId, admin.id, reason);
        await logAdminAction(admin.id, "unblock", userId, {
          blockedId,
          reason,
        });
        return NextResponse.json({ success: true, moderator: admin.name });
      }
      if (action === "report") {
        if (!targetId)
          return NextResponse.json(
            { error: "Missing required fields for report" },
            { status: 400 }
          );
        await reportUser(targetId, admin.id, reason, context);
        await logAdminAction(admin.id, "report", targetId, { reason });
        return NextResponse.json({ success: true, moderator: admin.name });
      }
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err: unknown) {
      await logAdminAction(admin.id, "failed_action", undefined, {
        action,
        error: (err as Error)?.message,
      });
      return NextResponse.json(
        { error: "Moderation action failed", details: (err as Error)?.message },
        { status: 500 }
      );
    }
  }
);
