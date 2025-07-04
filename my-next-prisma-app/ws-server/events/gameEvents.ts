import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

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
  socket.on('game:vote', ({ roomId, vote, mode }, cb) => {
    const userId = (socket as any).user?.id;
    const now = Date.now();
    if (userId && lastVote[userId] && now - lastVote[userId] < VOTE_THROTTLE_MS) {
      return cb?.({ error: 'You are voting too quickly' });
    }
    lastVote[userId] = now;
    if (!validateGameModeSchema(mode, vote)) {
      return cb({ error: 'Invalid vote for mode' });
    }
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