import { Server, Socket } from 'socket.io';
import { livekitService } from '../services/livekit';
import { webrtcFallbackService } from '../services/webrtcFallback';

export function registerVoiceEvents(io: Server, socket: Socket) {
  socket.on('voice:join', async ({ roomId }, cb) => {
    try {
      const user = (socket as any).user;
      if (!user) {
        cb?.({ success: false, error: 'User not authenticated' });
        return;
      }

      // Check if LiveKit is available
      if (!livekitService.isFallbackActive()) {
        try {
          // Generate LiveKit token
          const token = await livekitService.generateToken(user.id, roomId, {
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            metadata: JSON.stringify({ userId: user.id, name: user.name })
          });

          // Emit LiveKit join event with token
          socket.emit('voice:livekit-join', { token, roomId });
          io.to(roomId).emit('voice:user-joined', { user, mode: 'livekit' });
          
          // LiveKit connection successful
          socket.emit('voice_join_success', { roomId, provider: 'livekit' });
        } catch (error) {
          console.warn(`LiveKit join failed for room ${roomId}, falling back to WebRTC:`, error);
          // Fallback to WebRTC
          webrtcFallbackService.joinRoom(socket, roomId, user.id);
          io.to(roomId).emit('voice:user-joined', { user, mode: 'webrtc-fallback' });
        }
      } else {
        // Use WebRTC fallback
        webrtcFallbackService.joinRoom(socket, roomId, user.id);
        io.to(roomId).emit('voice:user-joined', { user, mode: 'webrtc-fallback' });
      }

      cb?.({ success: true });
    } catch (error) {
      console.error('Voice join error:', error);
      cb?.({ success: false, error: 'Failed to join voice room' });
    }
  });

  socket.on('voice:leave', ({ roomId }, cb) => {
    try {
      const user = (socket as any).user;
      if (!user) {
        cb?.({ success: false, error: 'User not authenticated' });
        return;
      }

      // Handle WebRTC fallback cleanup
      webrtcFallbackService.leaveRoom(socket, roomId);
      
      // Emit leave event
      io.to(roomId).emit('voice:user-left', { user });
      
      console.log(`Voice: User ${user.id} left room ${roomId}`);
      cb?.({ success: true });
    } catch (error) {
      console.error('Voice leave error:', error);
      cb?.({ success: false, error: 'Failed to leave voice room' });
    }
  });

  socket.on('voice:mute', ({ roomId, muted }, cb) => {
    try {
      const user = (socket as any).user;
      if (!user) {
        cb?.({ success: false, error: 'User not authenticated' });
        return;
      }

      // Handle WebRTC fallback mute
      webrtcFallbackService.handleMute(socket, roomId, muted);
      
      // Emit mute event
      io.to(roomId).emit('voice:user-muted', { user, muted });
      
      console.log(`Voice: User ${user.id} ${muted ? 'muted' : 'unmuted'} in room ${roomId}`);
      cb?.({ success: true });
    } catch (error) {
      console.error('Voice mute error:', error);
      cb?.({ success: false, error: 'Failed to update mute status' });
    }
  });

  socket.on('voice:push-to-talk', ({ roomId, speaking }, cb) => {
    try {
      const user = (socket as any).user;
      if (!user) {
        cb?.({ success: false, error: 'User not authenticated' });
        return;
      }

      // Handle WebRTC fallback push-to-talk
      webrtcFallbackService.handlePushToTalk(socket, roomId, speaking);
      
      // Emit speaking event
      io.to(roomId).emit('voice:user-speaking', { user, speaking });
      
      console.log(`Voice: User ${user.id} ${speaking ? 'started' : 'stopped'} speaking in room ${roomId}`);
      cb?.({ success: true });
    } catch (error) {
      console.error('Voice push-to-talk error:', error);
      cb?.({ success: false, error: 'Failed to update speaking status' });
    }
  });

  socket.on('voice:fallback', ({ roomId }, cb) => {
    try {
      const user = (socket as any).user;
      if (!user) {
        cb?.({ success: false, error: 'User not authenticated' });
        return;
      }

      // Force fallback mode
      livekitService.forceFallback();
      
      // Switch to WebRTC fallback
      webrtcFallbackService.joinRoom(socket, roomId, user.id);
      
      // Notify all clients in room to switch to fallback
      io.to(roomId).emit('voice:fallback-activated', { 
        user, 
        reason: 'Manual fallback triggered',
        mode: 'webrtc-fallback'
      });
      
      console.log(`Voice: Manual fallback triggered for room ${roomId} by user ${user.id}`);
      cb?.({ success: true });
    } catch (error) {
      console.error('Voice fallback error:', error);
      cb?.({ success: false, error: 'Failed to activate fallback' });
    }
  });

  // WebRTC fallback signaling events
  socket.on('webrtc:signaling', (data) => {
    const roomId = data.roomId;
    webrtcFallbackService.handleSignaling(socket, roomId, data);
  });

  // Health check endpoint for monitoring
  socket.on('voice:health-check', async (cb) => {
    try {
      const healthStatus = livekitService.getHealthStatus();
      const webrtcStats = webrtcFallbackService.getRoomStats();
      
      cb?.({
        success: true,
        livekit: healthStatus,
        webrtc: {
          activeRooms: webrtcStats.length,
          totalPeers: webrtcStats.reduce((sum, room) => sum + room.peerCount, 0)
        }
      });
    } catch (error) {
      console.error('Voice health check error:', error);
      cb?.({ success: false, error: 'Health check failed' });
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    // Clean up any WebRTC rooms this socket was in
    // (This will be handled by the WebRTC service's cleanup logic)
  });
}
// NOTE: For production, implement LiveKit signaling and fallback logic here. 