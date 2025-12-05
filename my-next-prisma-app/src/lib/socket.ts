import io from "socket.io-client";
import { useSession } from "next-auth/react";
import * as React from "react";
import { env } from "@/lib/env";

// Get socket instance type from the io function's return type
type SocketInstance = ReturnType<typeof io>;

// Types for Socket.IO events
export interface SocketUser {
  id: string;
  name: string;
  username: string;
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

export interface Vote {
  questionId?: string;
  option?: string | number;
  value?: string | number | boolean;
  [key: string]: unknown;
}

export interface VoteData {
  user: SocketUser;
  vote: Vote;
  roomId: string;
  type: string;
  mode: string;
}

export interface GameState {
  phase?: string;
  currentQuestion?: number;
  scores?: Record<string, number>;
  players?: SocketUser[];
  [key: string]: unknown;
}

export interface GameResult {
  winner?: string;
  scores?: Record<string, number>;
  duration?: number;
  [key: string]: unknown;
}

export interface SocketResponse {
  success?: boolean;
  error?: string;
  message?: string;
  data?: unknown;
}

export interface VoiceFallbackData {
  roomId: string;
  mode: "webrtc-fallback";
  reason?: string;
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
  onConnect?: () => void;
  onUserJoined?: (data: RoomEvent) => void;
  onUserLeft?: (data: RoomEvent) => void;
  onChatMessage?: (data: ChatMessage) => void;
  onVoteUpdate?: (data: VoteData) => void;
  onGameStateUpdate?: (data: GameState) => void;
  onGameStarted?: (data: GameState) => void;
  onGameEnded?: (data: GameResult) => void;
  onVoiceUserJoined?: (data: VoiceEvent) => void;
  onVoiceUserLeft?: (data: VoiceEvent) => void;
  onVoiceUserMuted?: (data: VoiceEvent) => void;
  onVoiceUserSpeaking?: (data: VoiceEvent) => void;
  onVoiceFallbackActivated?: (data: VoiceFallbackData) => void;
  onLivekitJoin?: (data: { token: string; roomId: string }) => void;
}

class SocketService {
  private socket: SocketInstance | null = null;
  private callbacks: SocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = Infinity; // Keep trying indefinitely for Render free tier
  private reconnectDelay = 2000; // 2 seconds initial delay
  private maxReconnectDelay = 30000; // Max 30 seconds between retries
  private isWakingUp = false;

  constructor() {
    // Initialize socket connection
    this.init();
  }

  private init() {
    const WS_SERVER_URL = env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

    this.socket = io(WS_SERVER_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity, // Never stop trying
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: this.maxReconnectDelay,
      timeout: 30000, // 30 second timeout for Render cold starts
      randomizationFactor: 0.5, // Add randomization to prevent thundering herd
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Remove any existing listeners first to prevent duplicates
    this.socket.removeAllListeners();

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      this.reconnectAttempts = 0;
      this.isWakingUp = false; // Reset immediately
      this.callbacks.onConnect?.();
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("⚠️ Disconnected from WebSocket server:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (_error: Error) => {
      this.reconnectAttempts++;

      // Check if it's a Render cold start (server is waking up)
      if (this.reconnectAttempts === 1 && !this.isWakingUp) {
        this.isWakingUp = true;
        console.log(
          "🔄 WebSocket server is waking up (Render free tier), please wait..."
        );
      } else if (this.reconnectAttempts % 5 === 0) {
        // Log every 5 attempts to avoid console spam
        console.log(
          `🔄 Reconnection attempt #${this.reconnectAttempts} - Server may be cold starting...`
        );
      }
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

    this.socket.on("game:state-update", (data: GameState) => {
      this.callbacks.onGameStateUpdate?.(data);
    });

    this.socket.on("game:started", (data: GameState) => {
      this.callbacks.onGameStarted?.(data);
    });

    this.socket.on("game:ended", (data: GameResult) => {
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

    this.socket.on("voice:fallback-activated", (data: VoiceFallbackData) => {
      this.callbacks.onVoiceFallbackActivated?.(data);
    });

    this.socket.on(
      "voice:livekit-join",
      (data: { token: string; roomId: string }) => {
        this.callbacks.onLivekitJoin?.(data);
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
      (
        this.socket as SocketInstance & {
          auth?: { userId: string; token?: string };
        }
      ).auth = { userId, token: userToken };
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

    this.socket.emit(
      "room:join",
      { roomId, roomType },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to join room:", response.error);
        }
      }
    );
  }

  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("room:leave", { roomId }, (response: SocketResponse) => {
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

    this.socket.emit("chat:send", payload, (response: SocketResponse) => {
      if (response?.error) {
        console.error("Failed to send chat message:", response.error);
      }
    });
  }

  // Moderation
  muteUser(userId: string, roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "chat:mute",
      { userId, roomId },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to mute user:", response.error);
        }
      }
    );
  }

  unmuteUser(userId: string, roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "chat:unmute",
      { userId, roomId },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to unmute user:", response.error);
        }
      }
    );
  }

  blockUser(userId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:block", { userId }, (response: SocketResponse) => {
      if (response?.error) {
        console.error("Failed to block user:", response.error);
      }
    });
  }

  unblockUser(userId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("chat:unblock", { userId }, (response: SocketResponse) => {
      if (response?.error) {
        console.error("Failed to unblock user:", response.error);
      }
    });
  }

  reportUser(userId: string, message: string) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "chat:report",
      { userId, message },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to report user:", response.error);
        }
      }
    );
  }

  // Voting
  castVote(payload: {
    roomId: string;
    vote: Vote;
    mode: string;
    type: string;
  }) {
    if (!this.socket?.connected) return;

    this.socket.emit("game:vote", payload, (response: SocketResponse) => {
      if (response?.error) {
        console.error("Failed to cast vote:", response.error);
      }
    });
  }

  // Game state
  updateGameState(roomId: string, state: GameState) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "game:state",
      { roomId, state },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to update game state:", response.error);
        }
      }
    );
  }

  startGame(roomId: string, mode: string) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "game:start",
      { roomId, mode },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to start game:", response.error);
        }
      }
    );
  }

  endGame(roomId: string, result: GameResult) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "game:end",
      { roomId, result },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to end game:", response.error);
        }
      }
    );
  }

  // Voice management
  joinVoiceRoom(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:join", { roomId }, (response: SocketResponse) => {
      if (response?.error) {
        console.error("Failed to join voice room:", response.error);
      }
    });
  }

  leaveVoiceRoom(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:leave", { roomId }, (response: SocketResponse) => {
      if (response?.error) {
        console.error("Failed to leave voice room:", response.error);
      }
    });
  }

  muteVoice(roomId: string, muted: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "voice:mute",
      { roomId, muted },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to mute voice:", response.error);
        }
      }
    );
  }

  pushToTalk(roomId: string, speaking: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "voice:push-to-talk",
      { roomId, speaking },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to update push-to-talk:", response.error);
        }
      }
    );
  }

  activateVoiceFallback(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "voice:fallback",
      { roomId },
      (response: SocketResponse) => {
        if (response?.error) {
          console.error("Failed to activate voice fallback:", response.error);
        }
      }
    );
  }

  // WebRTC fallback signaling
  sendWebRTCSignaling(data: Record<string, unknown>) {
    if (!this.socket?.connected) return;

    this.socket.emit("webrtc:signaling", data);
  }

  // Health check
  checkVoiceHealth() {
    if (!this.socket?.connected) return;

    this.socket.emit("voice:health-check", (response: SocketResponse) => {
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

  // Keep-alive mechanism to prevent Render from sleeping (call this periodically)
  startKeepAlive() {
    // Ping every 10 minutes to keep Render server awake
    const keepAliveInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("ping", { timestamp: Date.now() });
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Store interval ID for cleanup
    if (typeof window !== "undefined") {
      (
        window as Window & { __wsKeepAliveInterval?: NodeJS.Timeout }
      ).__wsKeepAliveInterval = keepAliveInterval;
    }
  }

  // Stop keep-alive
  stopKeepAlive() {
    if (typeof window !== "undefined") {
      const interval = (
        window as Window & { __wsKeepAliveInterval?: NodeJS.Timeout }
      ).__wsKeepAliveInterval;
      if (interval) {
        clearInterval(interval);
        delete (window as Window & { __wsKeepAliveInterval?: NodeJS.Timeout })
          .__wsKeepAliveInterval;
      }
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get reconnection status
  getConnectionInfo() {
    return {
      connected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      isWakingUp: this.isWakingUp,
    };
  }

  // Get socket instance (for advanced usage)
  getSocket(): SocketInstance | null {
    return this.socket;
  }

  // Cleanup method for proper disposal
  cleanup() {
    this.stopKeepAlive();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.isWakingUp = false;
  }
}

// Create singleton instance
export const socketService = new SocketService();

// React hook for using socket service with connection status
export const useSocket = () => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = React.useState(
    socketService.isConnected()
  );
  const [connectionInfo, setConnectionInfo] = React.useState(
    socketService.getConnectionInfo()
  );

  React.useEffect(() => {
    const socket = socketService.getSocket();

    // Update state immediately
    setIsConnected(socketService.isConnected());
    setConnectionInfo(socketService.getConnectionInfo());

    if (!socket) return;

    const updateState = () => {
      setIsConnected(socketService.isConnected());
      setConnectionInfo(socketService.getConnectionInfo());
    };

    socket.on("connect", updateState);
    socket.on("disconnect", updateState);
    socket.on("connect_error", updateState);

    // Poll for connection status updates every second
    const pollInterval = setInterval(updateState, 1000);

    return () => {
      clearInterval(pollInterval);
      socket.off("connect", updateState);
      socket.off("disconnect", updateState);
      socket.off("connect_error", updateState);
    };
  }, []);

  const connect = async () => {
    if (session?.user?.id) {
      socketService.connect(session.user.id);
      socketService.startKeepAlive(); // Start keep-alive pings
    }
  };

  const disconnect = () => {
    socketService.stopKeepAlive();
    socketService.disconnect();
  };

  return {
    socketService,
    connect,
    disconnect,
    isConnected,
    connectionInfo,
  };
};
