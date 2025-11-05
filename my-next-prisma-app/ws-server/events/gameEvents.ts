// ---
// game:vote event expected payload:
// {
//   roomId: string,
//   vote: any,
//   mode: string,
//   type: string // e.g., 'MCQ', 'TF', etc.
// }
// ---

import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { votePayloadSchema, VotePayload } from '../schemas/gameEvents';
import fs from 'fs';
import path from 'path';
import { createVoteLog } from '../services/voteLog';
import { allowVote } from '../services/voteThrottle';
import { votesTotal } from '../config/metrics';

// In-memory vote throttle (for demo only; use Redis in production)
const lastVote: Record<string, number> = {}; // userId: timestamp
const VOTE_THROTTLE_MS = 2000;

// Load schemas (placeholder: load default.json)
const schemaDir = path.join(__dirname, '../../schemas/game-modes/v1');
let defaultSchema: z.ZodTypeAny = z.any();
try {
  const schemaJson = JSON.parse(fs.readFileSync(path.join(schemaDir, 'default.json'), 'utf-8'));
  defaultSchema = z.object(schemaJson);
} catch {
  // fallback to any
}

function validateGameModeSchema(mode: string, payload: any): boolean {
  // TODO: Load correct schema by mode
  try {
    defaultSchema.parse(payload);
    return true;
  } catch {
    return false;
  }
}

export function registerGameEvents(io: Server, socket: Socket) {
  socket.on('game:vote', async (payload, cb) => {
      // Validate payload shape
      const parsed = votePayloadSchema.safeParse(payload);
      if (!parsed.success) {
        return cb?.({ error: 'Invalid payload', code: 'BAD_REQUEST', details: parsed.error.flatten() });
      }
      const { roomId, vote, mode, type } = parsed.data as VotePayload;
    const userId = (socket as any).user?.id;
    // Redis-based throttle (graceful if Redis down)
    if (userId) {
      const allowed = await allowVote(userId, roomId, VOTE_THROTTLE_MS);
      if (!allowed) return cb?.({ error: 'You are voting too quickly', code: 'RATE_LIMITED' });
    }
    if (!validateGameModeSchema(mode, vote)) {
      return cb?.({ error: 'Invalid vote for mode', code: 'INVALID_SCHEMA' });
    }
    // Log vote to Postgres
    if (userId && roomId && type) {
      await createVoteLog(userId, roomId, type);
    }
    // Increment Prometheus metric
    votesTotal.inc();
    io.to(roomId).emit('game:vote-update', { user: (socket as any).user, vote });
    cb?.({ success: true });
  });

  socket.on('game:state', ({ roomId, state }, cb) => {
    // TODO: Validate state transitions
    io.to(roomId).emit('game:state-update', { state });
    cb?.({ success: true });
  });

  socket.on('game:start', ({ roomId, mode }, cb) => {
    // TODO: Validate mode, check permissions
    io.to(roomId).emit('game:started', { mode });
    cb?.({ success: true });
  });

  socket.on('game:end', ({ roomId, result }, cb) => {
    // TODO: Store result, update stats
    io.to(roomId).emit('game:ended', { result });
    cb?.({ success: true });
  });
}
// NOTE: For production, move vote throttle to Redis and load schemas dynamically per mode/version. 