import { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";

interface VoiceChatState {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  mode: "livekit" | "webrtc-fallback" | "disconnected";
  roomId?: string;
  participants: Array<{
    userId: string;
    name: string;
    isMuted: boolean;
    isSpeaking: boolean;
  }>;
  error?: string;
}

interface UseVoiceChatOptions {
  userId: string;
  userName: string;
  socketUrl?: string;
  onError?: (error: string) => void;
  onModeChange?: (mode: "livekit" | "webrtc-fallback") => void;
}

export function useVoiceChat({
  userId,
  userName,
  socketUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
  onError,
  onModeChange,
}: UseVoiceChatOptions) {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isMuted: false,
    isSpeaking: false,
    mode: "disconnected",
    participants: [],
  });

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const rtcConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const socket = io(socketUrl, {
      auth: {
        userId,
        userName,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    });

    socket.on("disconnect", () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        mode: "disconnected",
        participants: [],
      }));
    });

    // Voice events
    socket.on(
      "voice:livekit-join",
      ({ token, roomId }: { token: string; roomId: string }) => {
        setState((prev) => ({
          ...prev,
          mode: "livekit",
          roomId,
        }));
        onModeChange?.("livekit");
        // Here you would initialize LiveKit client with the token
        console.log("LiveKit join with token:", token);
      }
    );

    socket.on(
      "voice:user-joined",
      ({ user, mode }: { user: any; mode: string }) => {
        setState((prev) => ({
          ...prev,
          mode: mode as "livekit" | "webrtc-fallback",
          participants: [
            ...prev.participants,
            {
              userId: user.id,
              name: user.name,
              isMuted: false,
              isSpeaking: false,
            },
          ],
        }));
        onModeChange?.(mode as "livekit" | "webrtc-fallback");
      }
    );

    socket.on("voice:user-left", ({ user }: { user: any }) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.userId !== user.id),
      }));
    });

    socket.on(
      "voice:user-muted",
      ({ user, muted }: { user: any; muted: boolean }) => {
        setState((prev) => ({
          ...prev,
          participants: prev.participants.map((p) =>
            p.userId === user.id ? { ...p, isMuted: muted } : p
          ),
        }));
      }
    );

    socket.on(
      "voice:user-speaking",
      ({ user, speaking }: { user: any; speaking: boolean }) => {
        setState((prev) => ({
          ...prev,
          participants: prev.participants.map((p) =>
            p.userId === user.id ? { ...p, isSpeaking: speaking } : p
          ),
        }));
      }
    );

    socket.on(
      "voice:fallback-activated",
      ({ reason, mode }: { reason: string; mode: string }) => {
        setState((prev) => ({ ...prev, mode: mode as "webrtc-fallback" }));
        onModeChange?.("webrtc-fallback");
        onError?.(`Voice system switched to fallback: ${reason}`);
      }
    );

    // WebRTC fallback events
    socket.on(
      "webrtc:peer-joined",
      ({
        userId: peerUserId,
        socketId,
      }: {
        userId: string;
        socketId: string;
      }) => {
        setState((prev) => ({
          ...prev,
          participants: [
            ...prev.participants,
            {
              userId: peerUserId,
              name: `User ${peerUserId.slice(0, 8)}`,
              isMuted: false,
              isSpeaking: false,
            },
          ],
        }));
      }
    );

    socket.on(
      "webrtc:peer-left",
      ({ userId: peerUserId }: { userId: string }) => {
        setState((prev) => ({
          ...prev,
          participants: prev.participants.filter(
            (p) => p.userId !== peerUserId
          ),
        }));
      }
    );

    socket.on(
      "webrtc:peer-muted",
      ({ userId: peerUserId, muted }: { userId: string; muted: boolean }) => {
        setState((prev) => ({
          ...prev,
          participants: prev.participants.map((p) =>
            p.userId === peerUserId ? { ...p, isMuted: muted } : p
          ),
        }));
      }
    );

    socket.on(
      "webrtc:peer-speaking",
      ({
        userId: peerUserId,
        speaking,
      }: {
        userId: string;
        speaking: boolean;
      }) => {
        setState((prev) => ({
          ...prev,
          participants: prev.participants.map((p) =>
            p.userId === peerUserId ? { ...p, isSpeaking: speaking } : p
          ),
        }));
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [userId, userName, socketUrl, onError, onModeChange]);

  // Join voice room
  const joinRoom = useCallback(
    async (roomId: string) => {
      if (!socketRef.current) {
        onError?.("Socket not connected");
        return false;
      }

      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        localStreamRef.current = stream;

        // Join voice room
        socketRef.current.emit("voice:join", { roomId }, (response: any) => {
          if (!response.success) {
            onError?.(response.error || "Failed to join voice room");
          }
        });

        return true;
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : "Failed to access microphone"
        );
        return false;
      }
    },
    [onError]
  );

  // Leave voice room
  const leaveRoom = useCallback(() => {
    if (!socketRef.current || !state.roomId) return;

    socketRef.current.emit("voice:leave", { roomId: state.roomId });

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close RTC connections
    rtcConnectionsRef.current.forEach((connection) => connection.close());
    rtcConnectionsRef.current.clear();

    setState((prev) => ({
      ...prev,
      mode: "disconnected",
      roomId: undefined,
      participants: [],
    }));
  }, [state.roomId]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!socketRef.current || !state.roomId) return;

    const newMuted = !state.isMuted;

    // Mute/unmute local stream
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }

    socketRef.current.emit("voice:mute", {
      roomId: state.roomId,
      muted: newMuted,
    });

    setState((prev) => ({ ...prev, isMuted: newMuted }));
  }, [state.isMuted, state.roomId]);

  // Push to talk
  const setSpeaking = useCallback(
    (speaking: boolean) => {
      if (!socketRef.current || !state.roomId) return;

      socketRef.current.emit("voice:push-to-talk", {
        roomId: state.roomId,
        speaking,
      });

      setState((prev) => ({ ...prev, isSpeaking: speaking }));
    },
    [state.roomId]
  );

  // Force fallback (for testing)
  const forceFallback = useCallback(() => {
    if (!socketRef.current || !state.roomId) return;

    socketRef.current.emit("voice:fallback", { roomId: state.roomId });
  }, [state.roomId]);

  // Health check
  const checkHealth = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit("voice:health-check", (response: any) => {
      if (response.success) {
        console.log("Voice health:", response);
      } else {
        onError?.(response.error || "Health check failed");
      }
    });
  }, [onError]);

  return {
    ...state,
    joinRoom,
    leaveRoom,
    toggleMute,
    setSpeaking,
    forceFallback,
    checkHealth,
  };
}
