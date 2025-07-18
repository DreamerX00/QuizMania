import { NextResponse } from 'next/server';
import { muteUser, unmuteUser, blockUser, unblockUser, reportUser } from '@/services/moderationService';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';
import { NextRequest } from 'next/server';

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

// TODO: Add authentication/authorization check here

export const POST = withValidation(moderationSchema, async (request: NextRequest) => {
  const { action, roomId, userId, byId, reason, blockedId, targetId, context } = (request as any).validated as ModerationRequest;
  try {
    if (action === 'mute') {
      if (!roomId || !userId || !byId) return NextResponse.json({ error: 'Missing required fields for mute' }, { status: 400 });
      await muteUser(roomId, userId, byId, reason);
      return NextResponse.json({ success: true });
    }
    if (action === 'unmute') {
      if (!roomId || !userId || !byId) return NextResponse.json({ error: 'Missing required fields for unmute' }, { status: 400 });
      await unmuteUser(roomId, userId, byId, reason);
      return NextResponse.json({ success: true });
    }
    if (action === 'block') {
      if (!userId || !blockedId || !byId) return NextResponse.json({ error: 'Missing required fields for block' }, { status: 400 });
      await blockUser(userId, blockedId, byId, reason);
      return NextResponse.json({ success: true });
    }
    if (action === 'unblock') {
      if (!userId || !blockedId || !byId) return NextResponse.json({ error: 'Missing required fields for unblock' }, { status: 400 });
      await unblockUser(userId, blockedId, byId, reason);
      return NextResponse.json({ success: true });
    }
    if (action === 'report') {
      if (!targetId || !byId) return NextResponse.json({ error: 'Missing required fields for report' }, { status: 400 });
      await reportUser(targetId, byId, reason, context);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Moderation action failed', details: (err as Error)?.message }, { status: 500 });
  }
}); 