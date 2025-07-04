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

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Validate room types config
validateRoomTypes();

// Attach Redis adapter
io.adapter(createAdapter(pubClient, subClient));

// Register global middleware
io.use(authMiddleware);
io.use(rateLimiter);
io.use(e2eeMiddleware);

// Register event handlers
io.on('connection', (socket) => {
  registerRoomEvents(io, socket);
  registerChatEvents(io, socket);
  registerGameEvents(io, socket);
  registerVoiceEvents(io, socket);
});

registerHealthEndpoint(app);

const PORT = process.env.WS_PORT || 4000;
server.listen(PORT, () => {
  logger.info(`WebSocket server running on port ${PORT}`);
}); 