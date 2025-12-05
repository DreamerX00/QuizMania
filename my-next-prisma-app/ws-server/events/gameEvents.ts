// ---
// game:vote event expected payload:
// {
//   roomId: string,
//   vote: any,
//   mode: string,
//   type: string // e.g., 'MCQ', 'TF', etc.
// }
// ---

import { Server, Socket } from "socket.io";
import { z } from "zod";
import { votePayloadSchema, VotePayload } from "../schemas/gameEvents";
import fs from "fs";
import path from "path";
import { createVoteLog } from "../services/voteLog";
import { allowVote } from "../services/voteThrottle";
import { votesTotal } from "../config/metrics";

// In-memory vote throttle (for demo only; use Redis in production)
const lastVote: Record<string, number> = {}; // userId: timestamp
const VOTE_THROTTLE_MS = 2000;

// Load schemas (placeholder: load default.json)
const schemaDir = path.join(__dirname, "../../schemas/game-modes/v1");
const schemaCache: Record<string, z.ZodTypeAny> = {};

// Load default schema
let defaultSchema: z.ZodTypeAny = z.any();
try {
  const schemaJson = JSON.parse(
    fs.readFileSync(path.join(schemaDir, "default.json"), "utf-8")
  );
  defaultSchema = z.object(schemaJson);
  schemaCache["default"] = defaultSchema;
} catch {
  // fallback to any
}

function validateGameModeSchema(mode: string, payload: any): boolean {
  // Load schema dynamically by mode
  try {
    // Check cache first
    if (!schemaCache[mode]) {
      const schemaPath = path.join(schemaDir, `${mode}.json`);
      if (fs.existsSync(schemaPath)) {
        const schemaJson = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
        schemaCache[mode] = z.object(schemaJson);
      } else {
        // Fall back to default schema
        schemaCache[mode] = defaultSchema;
      }
    }
    schemaCache[mode].parse(payload);
    return true;
  } catch (error) {
    console.error(`Schema validation failed for mode ${mode}:`, error);
    return false;
  }
}

export function registerGameEvents(io: Server, socket: Socket) {
  socket.on("game:vote", async (payload, cb) => {
    // Validate payload shape
    const parsed = votePayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return cb?.({
        error: "Invalid payload",
        code: "BAD_REQUEST",
        details: parsed.error.flatten(),
      });
    }
    const { roomId, vote, mode, type } = parsed.data as VotePayload;
    const userId = (socket as any).user?.id;
    // Redis-based throttle (graceful if Redis down)
    if (userId) {
      const allowed = await allowVote(userId, roomId, VOTE_THROTTLE_MS);
      if (!allowed)
        return cb?.({
          error: "You are voting too quickly",
          code: "RATE_LIMITED",
        });
    }
    if (!validateGameModeSchema(mode, vote)) {
      return cb?.({ error: "Invalid vote for mode", code: "INVALID_SCHEMA" });
    }
    // Log vote to Postgres
    if (userId && roomId && type) {
      await createVoteLog(userId, roomId, type);
    }
    // Increment Prometheus metric
    votesTotal.inc();
    io.to(roomId).emit("game:vote-update", {
      user: (socket as any).user,
      vote,
    });
    cb?.({ success: true });
  });

  socket.on("game:state", ({ roomId, state, currentState }, cb) => {
    // Validate state transitions
    const validStates = [
      "WAITING",
      "STARTING",
      "IN_PROGRESS",
      "PAUSED",
      "FINISHED",
    ];
    if (!validStates.includes(state)) {
      return cb?.({ error: "Invalid game state", code: "INVALID_STATE" });
    }

    // State machine validation - define valid transitions
    const validTransitions: Record<string, string[]> = {
      WAITING: ["STARTING"],
      STARTING: ["IN_PROGRESS", "WAITING"],
      IN_PROGRESS: ["PAUSED", "FINISHED"],
      PAUSED: ["IN_PROGRESS", "FINISHED"],
      FINISHED: [], // Terminal state
    };

    if (currentState && !validTransitions[currentState]?.includes(state)) {
      return cb?.({
        error: `Invalid state transition from ${currentState} to ${state}`,
        code: "INVALID_TRANSITION",
      });
    }

    io.to(roomId).emit("game:state-update", { state });
    cb?.({ success: true });
  });

  socket.on("game:start", async ({ roomId, mode }, cb) => {
    const userId = (socket as any).user?.id;

    // Validate mode
    const validModes = ["classic", "rapid", "survival", "multiplayer"];
    if (!validModes.includes(mode)) {
      return cb?.({ error: "Invalid game mode", code: "INVALID_MODE" });
    }

    if (!userId) {
      return cb?.({ error: "Authentication required", code: "UNAUTHORIZED" });
    }

    // Verify user is room host via database
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          memberships: {
            where: { userId, role: "HOST" },
          },
        },
      });

      await prisma.$disconnect();

      if (!room || room.memberships.length === 0) {
        return cb?.({
          error: "Only the room host can start the game",
          code: "FORBIDDEN",
        });
      }

      io.to(roomId).emit("game:started", { mode, startedBy: userId });
      cb?.({ success: true });
    } catch (error) {
      console.error("Error verifying host permissions:", error);
      return cb?.({
        error: "Failed to verify permissions",
        code: "SERVER_ERROR",
      });
    }
  });

  socket.on("game:end", async ({ roomId, result }, cb) => {
    const userId = (socket as any).user?.id;

    // Validate result structure
    if (!result || typeof result !== "object") {
      return cb?.({ error: "Invalid result format", code: "INVALID_RESULT" });
    }

    // Store result in database
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      // Update room status
      await prisma.room.update({
        where: { id: roomId },
        data: {
          status: "FINISHED",
        },
      });

      // Store game results
      // TODO: Create GameResult model in schema.prisma
      // if (result.scores && Array.isArray(result.scores)) {
      //   const gameResultPromises = result.scores.map(
      //     (score: { userId: string; score: number; rank?: number }) =>
      //       prisma.gameResult.create({
      //         data: {
      //           roomId,
      //           userId: score.userId,
      //           score: score.score,
      //           rank: score.rank || 0,
      //           completedAt: new Date(),
      //         },
      //       })
      //   );
      //   await Promise.all(gameResultPromises);
      // }

      await prisma.$disconnect();

      io.to(roomId).emit("game:ended", { result });
      cb?.({ success: true });
    } catch (error) {
      console.error("Error saving game result:", error);
      cb?.({ error: "Failed to save game result", code: "SERVER_ERROR" });
    }
  });
}
// NOTE: For production, move vote throttle to Redis and load schemas dynamically per mode/version.
