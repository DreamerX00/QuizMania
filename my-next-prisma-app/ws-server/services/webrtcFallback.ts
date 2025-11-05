import { redisClient } from '../config/redis';
import type { Socket } from 'socket.io';

type RoomState = {
  peers: Set<string>;
};

const rooms = new Map<string, RoomState>();

function getRoom(roomId: string): RoomState {
  let state = rooms.get(roomId);
  if (!state) {
    state = { peers: new Set() };
    rooms.set(roomId, state);
  }
  return state;
}

export const webrtcFallbackService = {
  joinRoom(socket: Socket, roomId: string, userId: string) {
    const state = getRoom(roomId);
    state.peers.add(userId);
    // record presence (best effort)
    redisClient.set(`webrtc:${roomId}:user:${userId}`, Date.now(), { EX: 60 }).catch(() => void 0);
    socket.join(`webrtc:${roomId}`);
    socket.to(`webrtc:${roomId}`).emit('webrtc:user-joined', { userId });
  },
  leaveRoom(socket: Socket, roomId: string) {
    const userId = (socket as any).user?.id || socket.id;
    const state = getRoom(roomId);
    state.peers.delete(userId);
    redisClient.del(`webrtc:${roomId}:user:${userId}`).catch(() => void 0);
    socket.leave(`webrtc:${roomId}`);
    socket.to(`webrtc:${roomId}`).emit('webrtc:user-left', { userId });
  },
  handleMute(socket: Socket, roomId: string, muted: boolean) {
    const userId = (socket as any).user?.id || socket.id;
    socket.to(`webrtc:${roomId}`).emit('webrtc:user-muted', { userId, muted });
  },
  handlePushToTalk(socket: Socket, roomId: string, speaking: boolean) {
    const userId = (socket as any).user?.id || socket.id;
    socket.to(`webrtc:${roomId}`).emit('webrtc:user-speaking', { userId, speaking });
  },
  handleSignaling(socket: Socket, roomId: string, data: any) {
    // Relay signaling messages to others in the fallback room
    socket.to(`webrtc:${roomId}`).emit('webrtc:signaling', data);
  },
  getRoomStats() {
    return Array.from(rooms.entries()).map(([roomId, state]) => ({ roomId, peerCount: state.peers.size }));
  },
};
