"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webrtcFallbackService = void 0;
class WebRTCFallbackService {
    constructor() {
        this.rooms = new Map();
        this.ROOM_TTL = 5 * 60 * 1000; // 5 minutes
        // Clean up expired rooms every minute
        setInterval(() => this.cleanupExpiredRooms(), 60000);
    }
    /**
     * Join a WebRTC room (fallback mode)
     */
    joinRoom(socket, roomId, userId) {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = {
                roomId,
                peers: new Map(),
                created: new Date()
            };
            this.rooms.set(roomId, room);
        }
        const peer = {
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
    leaveRoom(socket, roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const peer = room.peers.get(socket.id);
        if (!peer)
            return;
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
    handleSignaling(socket, roomId, data) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
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
    handleMute(socket, roomId, muted) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const peer = room.peers.get(socket.id);
        if (!peer)
            return;
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
    handlePushToTalk(socket, roomId, speaking) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const peer = room.peers.get(socket.id);
        if (!peer)
            return;
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
    getRoomStats() {
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
    cleanupExpiredRooms() {
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
    forceCleanup() {
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
exports.webrtcFallbackService = new WebRTCFallbackService();
