import { NextApiRequest, NextApiResponse } from 'next';
import { muteUser, unmuteUser, blockUser, unblockUser, reportUser } from '../../../../services/moderationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { action } = req.query;
  const { roomId, userId, byId, reason, blockedId, targetId, context } = req.body;
  try {
    if (action === 'mute') {
      await muteUser(roomId, userId, byId, reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'unmute') {
      await unmuteUser(roomId, userId, byId, reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'block') {
      await blockUser(userId, blockedId, byId, reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'unblock') {
      await unblockUser(userId, blockedId, byId, reason);
      return res.status(200).json({ success: true });
    }
    if (action === 'report') {
      await reportUser(targetId, byId, reason, context);
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: 'Moderation action failed', details: err?.message });
  }
} 