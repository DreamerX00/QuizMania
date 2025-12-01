import http from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import { createAdapter } from "@socket.io/redis-adapter";
import { validateRoomTypes } from "./config/roomTypes";
import { logger } from "./config/logger";
import { pubClient, subClient } from "./config/redis";
import { authMiddleware } from "./middleware/auth";
import { rateLimiter } from "./middleware/rateLimiter";
import { e2eeMiddleware } from "./middleware/e2ee";
import { registerRoomEvents } from "./events/roomEvents";
import { registerChatEvents } from "./events/chatEvents";
import { registerGameEvents } from "./events/gameEvents";
import { registerVoiceEvents } from "./events/voiceEvents";
import { registerHealthEndpoint } from "./healthz";
import {
  metricsRegistry,
  requestCounter,
  errorCounter,
  requestDuration,
  activeConnections,
  activeRooms,
  activeUsers,
  messagesTotal,
  votesTotal,
} from "./config/metrics";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Debug environment variables
logger.info("Environment check:", {
  hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
  clerkSecretPreview: process.env.CLERK_SECRET_KEY
    ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...`
    : "not set",
  nodeEnv: process.env.NODE_ENV,
  wsPort: process.env.WS_PORT,
});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
          ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// Prometheus metrics are imported from centralized module

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

// Validate room types config
validateRoomTypes();

// Attach Redis adapter (optional)
try {
  io.adapter(createAdapter(pubClient, subClient));
  logger.info("Redis adapter attached");
} catch (err) {
  logger.warn("Redis adapter not available - using in-memory adapter");
}

// Register global middleware (auth enabled unless explicitly disabled)
const authDisabled = process.env.WS_AUTH_DISABLED === "true";
if (!authDisabled) {
  io.use(authMiddleware);
  logger.info("WS auth middleware: ENABLED");
} else {
  logger.warn("WS auth middleware: DISABLED via WS_AUTH_DISABLED");
}
io.use(rateLimiter);
io.use(e2eeMiddleware);

// Track unique users (in-memory set, reset every 10 min for gauge)
const userSet = new Set<string>();
setInterval(() => {
  activeUsers.set(userSet.size);
  userSet.clear();
}, 10 * 60 * 1000);

// Instrument connection events
io.on("connection", (socket) => {
  activeConnections.inc();
  requestCounter.inc();
  const end = requestDuration.startTimer();

  // Provide default user object when auth is disabled
  if (!(socket as any).user) {
    (socket as any).user = { id: socket.id, name: "Anonymous User" };
  }

  if ((socket as any).user?.id) userSet.add((socket as any).user.id);
  registerRoomEvents(io, socket);
  registerChatEvents(io, socket);
  registerGameEvents(io, socket);
  registerVoiceEvents(io, socket);
  socket.on("disconnect", () => {
    activeConnections.dec();
    end();
  });
  socket.on("error", () => {
    errorCounter.inc();
  });
});

// Patch roomEvents and chatEvents to update metrics
// In registerRoomEvents, increment/decrement activeRooms on join/leave
// In registerChatEvents, increment messagesTotal on chat:send
// In registerGameEvents, increment votesTotal on game:vote

registerHealthEndpoint(app);

const PORT = process.env.PORT || process.env.WS_PORT || 4000;
server.listen(PORT, () => {
  logger.info(`WebSocket server running on port ${PORT}`);
});
