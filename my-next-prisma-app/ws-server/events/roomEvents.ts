import { Server, Socket } from 'socket.io';
import { redisClient } from '../config/redis';
import { roomTypes, RoomType } from '../config/roomTypes';
import { logger } from '../config/logger';
import { activeRooms } from '../config/metrics';

const roomCounts = new Map<string, number>();

function hasRoom(socket: Socket, roomId: string): boolean {
  // Support both Set (Socket.IO v4+) and object (older)
  if (socket.rooms instanceof Set) {
    return socket.rooms.has(roomId);
  } else if (typeof socket.rooms === 'object') {
    return Object.prototype.hasOwnProperty.call(socket.rooms, roomId);
  }
  return false;
}

export function registerRoomEvents(io: Server, socket: Socket) {
  socket.on('room:join', async ({ roomId, roomType }: { roomId: string; roomType: RoomType }, cb) => {
    try {
      if (!roomTypes[roomType]) return cb?.({ error: 'Invalid room type' });
      if (hasRoom(socket, roomId)) return cb?.({ error: 'Already joined' });
      await socket.join(roomId);
      // Set TTL for room metadata in Redis
      await redisClient.set(`room:${roomId}:type`, roomType, { EX: roomTypes[roomType].ttl });
      // Track active rooms
      const count = (roomCounts.get(roomId) || 0) + 1;
      roomCounts.set(roomId, count);
      if (count === 1) activeRooms.inc();
      cb?.({ success: true });
      const user = (socket as any).user || { id: socket.id, name: 'Anonymous User' };
      io.to(roomId).emit('room:user-joined', { user, roomId });
      logger.info({ user: user.id, roomId }, 'User joined room');
    } catch (err) {
      cb?.({ error: 'Failed to join room' });
    }
  });

  socket.on('room:leave', async ({ roomId }, cb) => {
    try {
      await socket.leave(roomId);
      // Track active rooms
      const count = (roomCounts.get(roomId) || 1) - 1;
      if (count <= 0) {
        roomCounts.delete(roomId);
        activeRooms.dec();
      } else {
        roomCounts.set(roomId, count);
      }
      cb?.({ success: true });
      const user = (socket as any).user || { id: socket.id, name: 'Anonymous User' };
      io.to(roomId).emit('room:user-left', { user, roomId });
      logger.info({ user: user.id, roomId }, 'User left room');
    } catch (err) {
      cb?.({ error: 'Failed to leave room' });
    }
  });

  // Heartbeat for silent disconnects
  socket.on('room:heartbeat', ({ roomId }) => {
    // Optionally update last-seen in Redis
    redisClient.set(`room:${roomId}:heartbeat:${socket.id}`, Date.now(), { EX: 60 });
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const user = (socket as any).user || { id: socket.id, name: 'Anonymous User' };
        io.to(roomId).emit('room:user-left', { user, roomId });
        logger.info({ user: user.id, roomId }, 'User left room (disconnect)');
      }
    }
  });
} 