import { Server, Socket } from 'socket.io';

export function registerVoiceEvents(io: Server, socket: Socket) {
  socket.on('voice:join', ({ roomId }, cb) => {
    // TODO: Integrate with LiveKit signaling (join room, get token, etc.)
    // If LiveKit fails, emit fallback event
    io.to(roomId).emit('voice:user-joined', { user: (socket as any).user });
    cb?.({ success: true });
  });

  socket.on('voice:leave', ({ roomId }, cb) => {
    // TODO: Integrate with LiveKit signaling (leave room)
    io.to(roomId).emit('voice:user-left', { user: (socket as any).user });
    cb?.({ success: true });
  });

  socket.on('voice:mute', ({ roomId, muted }, cb) => {
    io.to(roomId).emit('voice:user-muted', { user: (socket as any).user, muted });
    cb?.({ success: true });
  });

  socket.on('voice:push-to-talk', ({ roomId, speaking }, cb) => {
    io.to(roomId).emit('voice:user-speaking', { user: (socket as any).user, speaking });
    cb?.({ success: true });
  });

  socket.on('voice:fallback', ({ roomId }, cb) => {
    // TODO: Trigger fallback to native WebRTC (emit event to clients to switch stack)
    io.to(roomId).emit('voice:fallback', { user: (socket as any).user });
    cb?.({ success: true });
  });
}
// NOTE: For production, implement LiveKit signaling and fallback logic here. 