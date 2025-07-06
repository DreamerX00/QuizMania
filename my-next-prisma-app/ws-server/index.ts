import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';
import { createAdapter } from '@socket.io/redis-adapter';
import { validateRoomTypes } from './config/roomTypes';
import { logger } from './config/logger';
import { pubClient, subClient } from './config/redis';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { e2eeMiddleware } from './middleware/e2ee';
import { registerRoomEvents } from './events/roomEvents';
import { registerChatEvents } from './events/chatEvents';
import { registerGameEvents } from './events/gameEvents';
import { registerVoiceEvents } from './events/voiceEvents';
import { registerHealthEndpoint } from './healthz';
import client, { Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Debug environment variables
logger.info('Environment check:', {
  hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
  clerkSecretPreview: process.env.CLERK_SECRET_KEY ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` : 'not set',
  nodeEnv: process.env.NODE_ENV,
  wsPort: process.env.WS_PORT
});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Prometheus metrics
collectDefaultMetrics();
const requestCounter = new Counter({ name: 'ws_server_requests_total', help: 'Total requests' });
const errorCounter = new Counter({ name: 'ws_server_errors_total', help: 'Total errors' });
const requestDuration = new Histogram({ name: 'ws_server_request_duration_seconds', help: 'Request duration (seconds)' });
const activeConnections = new Gauge({ name: 'ws_server_active_connections', help: 'Active WebSocket connections' });
// Business metrics
const activeRooms = new Gauge({ name: 'ws_server_active_rooms', help: 'Active rooms' });
const activeUsers = new Gauge({ name: 'ws_server_active_users', help: 'Active users' });
const messagesTotal = new Counter({ name: 'ws_server_messages_total', help: 'Total chat messages sent' });
const votesTotal = new Counter({ name: 'ws_server_votes_total', help: 'Total votes cast' });

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Validate room types config
validateRoomTypes();

// Attach Redis adapter (optional)
try {
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Redis adapter attached');
} catch (err) {
  logger.warn('Redis adapter not available - using in-memory adapter');
}

// Register global middleware
// io.use(authMiddleware); // Temporarily disabled for client-side testing
io.use(rateLimiter);
io.use(e2eeMiddleware);

// Track unique users (in-memory set, reset every 10 min for gauge)
const userSet = new Set<string>();
setInterval(() => {
  activeUsers.set(userSet.size);
  userSet.clear();
}, 10 * 60 * 1000);

// Instrument connection events
io.on('connection', (socket) => {
  activeConnections.inc();
  requestCounter.inc();
  const end = requestDuration.startTimer();
  
  // Provide default user object when auth is disabled
  if (!(socket as any).user) {
    (socket as any).user = { id: socket.id, name: 'Anonymous User' };
  }
  
  if ((socket as any).user?.id) userSet.add((socket as any).user.id);
  registerRoomEvents(io, socket);
  registerChatEvents(io, socket);
  registerGameEvents(io, socket);
  registerVoiceEvents(io, socket);
  socket.on('disconnect', () => {
    activeConnections.dec();
    end();
  });
  socket.on('error', () => {
    errorCounter.inc();
  });
});

// Patch roomEvents and chatEvents to update metrics
// In registerRoomEvents, increment/decrement activeRooms on join/leave
// In registerChatEvents, increment messagesTotal on chat:send
// In registerGameEvents, increment votesTotal on game:vote

registerHealthEndpoint(app);

const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  logger.info(`WebSocket server running on port ${PORT}`);
}); 