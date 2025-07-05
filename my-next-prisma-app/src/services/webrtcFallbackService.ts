import { Server, Socket } from 'socket.io';

interface WebRTCPeer {
  userId: string;
  socketId: string;
  roomId: string;
  isMuted: boolean;
  isSpeaking: boolean;
  rtcConnection?: RTCPeerConnection;
}

interface WebRTCRoom {
  roomId: string;
  peers: Map<string, WebRTCPeer>;
  created: Date;
}

class WebRTCFallbackService {
  private rooms: Map<string, WebRTCRoom> = new Map();
  private readonly ROOM_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Clean up expired rooms every minute
    setInterval(() => this.cleanupExpiredRooms(), 60000);
  }

  /**
   * Join a WebRTC room (fallback mode)
   */
  joinRoom(socket: Socket, roomId: string, userId: string): void {
    let room = this.rooms.get(roomId);
    
    if (!room) {
      room = {
        roomId,
        peers: new Map(),
        created: new Date()
      };
      this.rooms.set(roomId, room);
    }

    const peer: WebRTCPeer = {
      userId,
      socketId: socket.id,
      roomId,
      isMuted: false,
      isSpeaking: false
    };

    room.peers.set(socket.id, peer);

    // Notify other peers in the room
    socket.to(roomId).emit('webrtc:peer-joined', {
      userId,
      socketId: socket.id
    });

    // Send list of existing peers to the new user
    const existingPeers = Array.from(room.peers.values())
      .filter(p => p.socketId !== socket.id)
      .map(p => ({
        userId: p.userId,
        socketId: p.socketId,
        isMuted: p.isMuted
      }));

    socket.emit('webrtc:room-peers', existingPeers);

    console.log(`WebRTC: User ${userId} joined room ${roomId} (fallback mode)`);
  }

  /**
   * Leave a WebRTC room
   */
  leaveRoom(socket: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const peer = room.peers.get(socket.id);
    if (!peer) return;

    // Close RTC connection if exists
    if (peer.rtcConnection) {
      peer.rtcConnection.close();
    }

    // Remove peer from room
    room.peers.delete(socket.id);

    // Notify other peers
    socket.to(roomId).emit('webrtc:peer-left', {
      userId: peer.userId,
      socketId: socket.id
    });

    // Clean up empty rooms
    if (room.peers.size === 0) {
      this.rooms.delete(roomId);
    }

    console.log(`WebRTC: User ${peer.userId} left room ${roomId} (fallback mode)`);
  }

  /**
   * Handle WebRTC signaling (offer/answer/ice-candidate)
   */
  handleSignaling(socket: Socket, roomId: string, data: {
    type: 'offer' | 'answer' | 'ice-candidate';
    targetSocketId: string;
    payload: any;
  }): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Forward signaling to target peer
    socket.to(data.targetSocketId).emit('webrtc:signaling', {
      type: data.type,
      fromSocketId: socket.id,
      payload: data.payload
    });
  }

  /**
   * Handle mute/unmute in fallback mode
   */
  handleMute(socket: Socket, roomId: string, muted: boolean): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const peer = room.peers.get(socket.id);
    if (!peer) return;

    peer.isMuted = muted;

    // Notify other peers
    socket.to(roomId).emit('webrtc:peer-muted', {
      userId: peer.userId,
      socketId: socket.id,
      muted
    });
  }

  /**
   * Handle push-to-talk in fallback mode
   */
  handlePushToTalk(socket: Socket, roomId: string, speaking: boolean): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const peer = room.peers.get(socket.id);
    if (!peer) return;

    peer.isSpeaking = speaking;

    // Notify other peers
    socket.to(roomId).emit('webrtc:peer-speaking', {
      userId: peer.userId,
      socketId: socket.id,
      speaking
    });
  }

  /**
   * Get room statistics for monitoring
   */
  getRoomStats(): Array<{
    roomId: string;
    peerCount: number;
    created: Date;
    age: number;
  }> {
    return Array.from(this.rooms.values()).map(room => ({
      roomId: room.roomId,
      peerCount: room.peers.size,
      created: room.created,
      age: Date.now() - room.created.getTime()
    }));
  }

  /**
   * Clean up expired rooms
   */
  private cleanupExpiredRooms(): void {
    const now = Date.now();
    for (const [roomId, room] of this.rooms.entries()) {
      const age = now - room.created.getTime();
      if (age > this.ROOM_TTL) {
        // Close all RTC connections
        for (const peer of room.peers.values()) {
          if (peer.rtcConnection) {
            peer.rtcConnection.close();
          }
        }
        this.rooms.delete(roomId);
        console.log(`WebRTC: Cleaned up expired room ${roomId}`);
      }
    }
  }

  /**
   * Force cleanup of all rooms (for testing)
   */
  forceCleanup(): void {
    for (const [roomId, room] of this.rooms.entries()) {
      for (const peer of room.peers.values()) {
        if (peer.rtcConnection) {
          peer.rtcConnection.close();
        }
      }
    }
    this.rooms.clear();
    console.log('WebRTC: Force cleaned up all rooms');
  }
}

// Export singleton instance
export const webrtcFallbackService = new WebRTCFallbackService(); 