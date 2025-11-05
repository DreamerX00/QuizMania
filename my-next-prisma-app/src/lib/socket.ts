import io from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

// Get socket instance type from the io function's return type
type SocketInstance = ReturnType<typeof io>;

// Types for Socket.IO events
export interface SocketUser {
  id: string;
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "in-match";
}

export interface ChatMessage {
  user: SocketUser;
  message: string;
  timestamp: number;
  type: "match" | "clan" | "room" | "public" | "friend";
  roomId?: string;
  clanId?: string;
  receiverId?: string;
}

export interface VoteData {
  user: SocketUser;
  vote: any;
  roomId: string;
  type: string;
  mode: string;
}

export interface RoomEvent {
  user: SocketUser;
  roomId: string;
  action: "joined" | "left";
}

export interface VoiceEvent {
  user: SocketUser;
  roomId: string;
  action:
    | "joined"
    | "left"
    | "muted"
    | "unmuted"
    | "speaking"
    | "stopped-speaking";
  mode?: "livekit" | "webrtc-fallback";
}

// Socket event callbacks
export interface SocketCallbacks {
  onUserJoined?: (data: RoomEvent) => void;
  onUserLeft?: (data: RoomEvent) => void;
  onChatMessage?: (data: ChatMessage) => void;
  onVoteUpdate?: (data: VoteData) => void;
  onGameStateUpdate?: (data: any) => void;
  onGameStarted?: (data: any) => void;
  onGameEnded?: (data: any) => void;
  onVoiceUserJoined?: (data: VoiceEvent) => void;
  onVoiceUserLeft?: (data: VoiceEvent) => void;
  onVoiceUserMuted?: (data: VoiceEvent) => void;
  onVoiceUserSpeaking?: (data: VoiceEvent) => void;
  onVoiceFallbackActivated?: (data: any) => void;
  onLiveKitJoin?: (data: { token: string; roomId: string }) => void;
}

class SocketService {
  private socket: SocketInstance | null = null;
  private callbacks: SocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    // Initialize socket connection
    this.init();
  }

  private init() {
    const WS_SERVER_URL =
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

    this.socket = io(WS_SERVER_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Remove any existing listeners first to prevent duplicates
    this.socket.removeAllListeners();

    // Connection events
    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Disconnected from WebSocket server:", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("WebSocket connection error:", error);
      this.reconnectAttempts++;
    });

    // Room events
    this.socket.on("room:user-joined", (data: RoomEvent) => {
      this.callbacks.onUserJoined?.(data);
    });

    this.socket.on("room:user-left", (data: RoomEvent) => {
      this.callbacks.onUserLeft?.(data);
    });

    // Chat events
    this.socket.on("chat:message", (data: ChatMessage) => {
      this.callbacks.onChatMessage?.(data);
    });

    // Game events
    this.socket.on("game:vote-update", (data: VoteData) => {
      this.callbacks.onVoteUpdate?.(data);
    });

    this.socket.on("game:state-update", (data: any) => {
      this.callbacks.onGameStateUpdate?.(data);
    });

    this.socket.on("game:started", (data: any) => {
      this.callbacks.onGameStarted?.(data);
    });

    this.socket.on("game:ended", (data: any) => {
      this.callbacks.onGameEnded?.(data);
    });

    // Voice events
    this.socket.on("voice:user-joined", (data: VoiceEvent) => {
      this.callbacks.onVoiceUserJoined?.(data);
    });

    this.socket.on("voice:user-left", (data: VoiceEvent) => {
      this.callbacks.onVoiceUserLeft?.(data);
    });

    this.socket.on("voice:user-muted", (data: VoiceEvent) => {
      this.callbacks.onVoiceUserMuted?.(data);
    });

    this.socket.on("voice:user-speaking", (data: VoiceEvent) => {
      this.callbacks.onVoiceUserSpeaking?.(data);
    });

    this.socket.on("voice:fallback-activated", (data: any) => {
      this.callbacks.onVoiceFallbackActivated?.(data);
    });

    this.socket.on(
      "voice:livekit-join",
      (data: { token: string; roomId: string }) => {
        this.callbacks.onLiveKitJoin?.(data);
      }
    );
  }

  // Connect to WebSocket server
  connect(userId: string, userToken?: string) {
    if (!this.socket) {
      this.init();
    }

    if (this.socket && !this.socket.connected) {
      // Debug logging
      console.log("Connecting to WebSocket with:", {
        userId,
        hasToken: !!userToken,
        tokenLength: userToken?.length,
        tokenPreview: userToken
          ? `${userToken.substring(0, 20)}...`
          : "no token",
      });

      // Set auth data (optional when auth is disabled)
      (this.socket as any).auth = { userId, token: userToken };
      this.socket.connect();
    }
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Set event callbacks
  setCallbacks(callbacks: SocketCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Room management
  joinRoom(roomId: string, roomType: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("room:join", { roomId, roomType }, (response: any) => {
      if (response?.error) {
        console.error("Failed to join room:", response.error);
      }
    });
  }

  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("room:leave", { roomId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to leave room:", response.error);
      }
    });
  }

  // Chat management
  sendChatMessage(payload: {
    type: "match" | "clan" | "room" | "public" | "friend";
    message: string;
    roomId?: string;
    clanId?: string;
    receiverId?: string;
  }) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:send", payload, (response: any) => {
      if (response?.error) {
        console.error("Failed to send chat message:", response.error);
      }
    });
  }

  // Moderation
  muteUser(userId: string, roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:mute", { userId, roomId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to mute user:", response.error);
      }
    });
  }

  unmuteUser(userId: string, roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:unmute", { userId, roomId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to unmute user:", response.error);
      }
    });
  }

  blockUser(userId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:block", { userId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to block user:", response.error);
      }
    });
  }

  unblockUser(userId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:unblock", { userId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to unblock user:", response.error);
      }
    });
  }

  reportUser(userId: string, message: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:report", { userId, message }, (response: any) => {
      if (response?.error) {
        console.error("Failed to report user:", response.error);
      }
    });
  }

  // Voting
  castVote(payload: { roomId: string; vote: any; mode: string; type: string }) {
    if (!this.socket?.connected) return;

    this.socket.emit("game:vote", payload, (response: any) => {
      if (response?.error) {
        console.error("Failed to cast vote:", response.error);
      }
    });
  }

  // Game state
  updateGameState(roomId: string, state: any) {
    if (!this.socket?.connected) return;

    this.socket.emit("game:state", { roomId, state }, (response: any) => {
      if (response?.error) {
        console.error("Failed to update game state:", response.error);
      }
    });
  }

  startGame(roomId: string, mode: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("game:start", { roomId, mode }, (response: any) => {
      if (response?.error) {
        console.error("Failed to start game:", response.error);
      }
    });
  }

  endGame(roomId: string, result: any) {
    if (!this.socket?.connected) return;

    this.socket.emit("game:end", { roomId, result }, (response: any) => {
      if (response?.error) {
        console.error("Failed to end game:", response.error);
      }
    });
  }

  // Voice management
  joinVoiceRoom(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:join", { roomId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to join voice room:", response.error);
      }
    });
  }

  leaveVoiceRoom(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:leave", { roomId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to leave voice room:", response.error);
      }
    });
  }

  muteVoice(roomId: string, muted: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:mute", { roomId, muted }, (response: any) => {
      if (response?.error) {
        console.error("Failed to mute voice:", response.error);
      }
    });
  }

  pushToTalk(roomId: string, speaking: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "voice:push-to-talk",
      { roomId, speaking },
      (response: any) => {
        if (response?.error) {
          console.error("Failed to update push-to-talk:", response.error);
        }
      }
    );
  }

  activateVoiceFallback(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:fallback", { roomId }, (response: any) => {
      if (response?.error) {
        console.error("Failed to activate voice fallback:", response.error);
      }
    });
  }

  // WebRTC fallback signaling
  sendWebRTCSignaling(data: any) {
    if (!this.socket?.connected) return;

    this.socket.emit("webrtc:signaling", data);
  }

  // Health check
  checkVoiceHealth() {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:health-check", (response: any) => {
      if (response?.error) {
        console.error("Voice health check failed:", response.error);
      } else {
        console.log("Voice health status:", response);
      }
    });
  }

  // Heartbeat
  sendHeartbeat(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("room:heartbeat", { roomId });
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for advanced usage)
  getSocket(): SocketInstance | null {
    return this.socket;
  }

  // Cleanup method for proper disposal
  cleanup() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.callbacks = {};
    this.reconnectAttempts = 0;
  }
}

// Create singleton instance
export const socketService = new SocketService();

// React hook for using socket service
export const useSocket = () => {
  const { userId, getToken } = useAuth();

  const connect = async () => {
    if (userId) {
      const token = await getToken();
      socketService.connect(userId, token || undefined);
    }
  };

  const disconnect = () => {
    socketService.disconnect();
  };

  return {
    socketService,
    connect,
    disconnect,
    isConnected: socketService.isConnected(),
  };
};
