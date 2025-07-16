import { NextApiRequest, NextApiResponse } from 'next';
import { muteUser, unmuteUser, blockUser, unblockUser, reportUser } from '../../../../services/moderationService';
import { z } from 'zod';
import validator from 'validator';

const baseSchema = z.object({
  action: z.string().min(1),
  roomId: z.string().optional(),
  userId: z.string().optional(),
  byId: z.string().optional(),
  reason: z.string().optional(),
  blockedId: z.string().optional(),
  targetId: z.string().optional(),
  context: z.any().optional(),
});

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return validator.escape(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  // TODO: Add authentication/authorization check here
  const { action } = req.query;
  const parsed = baseSchema.safeParse({ ...req.body, action });
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'One or more fields failed validation',
      details: parsed.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }
  const body = sanitizeObject(parsed.data);
  try {
    if (action === 'mute') {
      await muteUser(body.roomId, body.userId, body.byId, body.reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'unmute') {
      await unmuteUser(body.roomId, body.userId, body.byId, body.reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'block') {
      await blockUser(body.userId, body.blockedId, body.byId, body.reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'unblock') {
      await unblockUser(body.userId, body.blockedId, body.byId, body.reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'report') {
      await reportUser(body.targetId, body.byId, body.reason, body.context);
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: 'Moderation action failed', details: err?.message });
  }
} 