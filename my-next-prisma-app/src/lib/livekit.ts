import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Participant,
  DataPacket_Kind,
  DisconnectReason,
  RemoteTrackPublication,
  LocalTrackPublication,
  Track,
  TrackPublication,
  AudioPresets,
  VideoPresets,
  RoomOptions,
  ConnectionState,
  ParticipantEvent,
  TrackEvent,
  AudioCaptureOptions,
  VideoCaptureOptions,
  ScreenShareCaptureOptions,
  VideoCodec,
} from "livekit-client";

// Voice chat state
export interface VoiceState {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  participants: Map<string, Participant>;
  localParticipant: LocalParticipant | null;
  room: Room | null;
  mode: "livekit" | "webrtc-fallback" | "disconnected";
  error: string | null;
}

// Voice chat callbacks
export interface VoiceCallbacks {
  onParticipantJoined?: (participant: RemoteParticipant) => void;
  onParticipantLeft?: (participant: RemoteParticipant) => void;
  onParticipantMuted?: (participant: Participant, muted: boolean) => void;
  onParticipantSpeaking?: (participant: Participant, speaking: boolean) => void;
  onConnectionStateChanged?: (state: ConnectionState) => void;
  onDataReceived?: (
    payload: Uint8Array,
    participant: RemoteParticipant
  ) => void;
  onTrackSubscribed?: (
    track: Track,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => void;
  onTrackUnsubscribed?: (
    track: Track,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => void;
  onLocalTrackPublished?: (publication: LocalTrackPublication) => void;
  onLocalTrackUnpublished?: (publication: LocalTrackPublication) => void;
  onDisconnected?: (reason?: DisconnectReason) => void;
  onError?: (error: Error) => void;
}

class LiveKitService {
  private room: Room | null = null;
  private callbacks: VoiceCallbacks = {};
  private state: VoiceState = {
    isConnected: false,
    isMuted: false,
    isSpeaking: false,
    participants: new Map(),
    localParticipant: null,
    room: null,
    mode: "disconnected",
    error: null,
  };

  constructor() {
    // LiveKit client options - log level is now configured differently
    // Room.setLogLevel(LogLevel.warn); // This method doesn't exist in current version
  }

  // Set event callbacks
  setCallbacks(callbacks: VoiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Connect to LiveKit room
  async connect(
    token: string,
    roomName: string,
    options?: RoomOptions
  ): Promise<void> {
    try {
      // Create new room instance
      this.room = new Room(options);

      // Set up room event listeners
      this.setupRoomEventListeners();

      // Connect to room - URL should be from env or passed as parameter
      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
      await this.room.connect(livekitUrl, token);

      // Update state
      this.state.room = this.room;
      this.state.localParticipant = this.room.localParticipant;
      this.state.isConnected = true;
      this.state.mode = "livekit";
      this.state.error = null;

      // Add local participant to participants map
      this.state.participants.set(
        this.room.localParticipant.identity,
        this.room.localParticipant
      );

      console.log("Connected to LiveKit room:", roomName);
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : "Unknown error";
      this.state.mode = "disconnected";
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error("Failed to connect")
      );
      throw error;
    }
  }

  // Disconnect from LiveKit room
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      this.state.room = null;
      this.state.localParticipant = null;
      this.state.isConnected = false;
      this.state.mode = "disconnected";
      this.state.participants.clear();
      this.state.error = null;
    }
  }

  // Mute/unmute local audio
  async setMuted(muted: boolean): Promise<void> {
    if (!this.room?.localParticipant) return;

    try {
      if (muted) {
        await this.room.localParticipant.setMicrophoneEnabled(false);
      } else {
        await this.room.localParticipant.setMicrophoneEnabled(true);
      }
      this.state.isMuted = muted;
    } catch (error) {
      console.error("Failed to set muted state:", error);
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error("Failed to set muted state")
      );
    }
  }

  // Enable/disable push-to-talk
  async setPushToTalk(enabled: boolean): Promise<void> {
    if (!this.room?.localParticipant) return;

    try {
      if (enabled) {
        // Enable push-to-talk mode
        await this.room.localParticipant.setMicrophoneEnabled(false);
        // Set up keyboard listeners for push-to-talk
        this.setupPushToTalkListeners();
      } else {
        // Disable push-to-talk mode
        this.removePushToTalkListeners();
        await this.room.localParticipant.setMicrophoneEnabled(true);
      }
    } catch (error) {
      console.error("Failed to set push-to-talk:", error);
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error("Failed to set push-to-talk")
      );
    }
  }

  // Send data to room
  async sendData(payload: Uint8Array, topic?: string): Promise<void> {
    if (!this.room?.localParticipant) return;

    try {
      await this.room.localParticipant.publishData(payload, {
        topic,
      } as any);
    } catch (error) {
      console.error("Failed to send data:", error);
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error("Failed to send data")
      );
    }
  }

  // Get room statistics
  getRoomStats() {
    if (!this.room) return null;

    return {
      participants: this.state.participants.size,
      localParticipant: this.room.localParticipant.identity,
      connectionState: (this.room as any).state || "unknown",
      isConnected: this.state.isConnected,
      mode: this.state.mode,
    };
  }

  // Get current voice state
  getVoiceState(): VoiceState {
    return { ...this.state };
  }

  // Check if connected
  isConnected(): boolean {
    return this.state.isConnected;
  }

  // Check if muted
  isMuted(): boolean {
    return this.state.isMuted;
  }

  // Check if speaking
  isSpeaking(): boolean {
    return this.state.isSpeaking;
  }

  // Get participants
  getParticipants(): Map<string, Participant> {
    return new Map(this.state.participants);
  }

  // Get local participant
  getLocalParticipant(): LocalParticipant | null {
    return this.state.localParticipant;
  }

  // Get room instance
  getRoom(): Room | null {
    return this.room;
  }

  // Setup room event listeners
  private setupRoomEventListeners() {
    if (!this.room) return;

    // Connection state changes
    this.room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log("LiveKit connection state changed:", state);
      this.callbacks.onConnectionStateChanged?.(state);
    });

    // Participant events
    this.room.on(
      RoomEvent.ParticipantConnected,
      (participant: RemoteParticipant) => {
        console.log("Participant joined:", participant.identity);
        this.state.participants.set(participant.identity, participant);
        this.callbacks.onParticipantJoined?.(participant);
      }
    );

    this.room.on(
      RoomEvent.ParticipantDisconnected,
      (participant: RemoteParticipant) => {
        console.log("Participant left:", participant.identity);
        this.state.participants.delete(participant.identity);
        this.callbacks.onParticipantLeft?.(participant);
      }
    );

    // Track events
    this.room.on(
      RoomEvent.TrackSubscribed,
      (
        track: Track,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        console.log(
          "Track subscribed:",
          track.kind,
          "from",
          participant.identity
        );
        this.callbacks.onTrackSubscribed?.(track, publication, participant);
      }
    );

    this.room.on(
      RoomEvent.TrackUnsubscribed,
      (
        track: Track,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        console.log(
          "Track unsubscribed:",
          track.kind,
          "from",
          participant.identity
        );
        this.callbacks.onTrackUnsubscribed?.(track, publication, participant);
      }
    );

    // Local track events
    this.room.on(
      RoomEvent.LocalTrackPublished,
      (publication: LocalTrackPublication) => {
        console.log("Local track published:", publication.kind);
        this.callbacks.onLocalTrackPublished?.(publication);
      }
    );

    this.room.on(
      RoomEvent.LocalTrackUnpublished,
      (publication: LocalTrackPublication) => {
        console.log("Local track unpublished:", publication.kind);
        this.callbacks.onLocalTrackUnpublished?.(publication);
      }
    );

    // Data received
    this.room.on(
      RoomEvent.DataReceived,
      (
        payload: Uint8Array,
        participant?: RemoteParticipant,
        kind?: any,
        topic?: string
      ) => {
        if (participant) {
          this.callbacks.onDataReceived?.(payload, participant);
        }
      }
    );

    // Disconnected
    this.room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
      console.log("Disconnected from LiveKit room:", reason);
      this.state.isConnected = false;
      this.state.mode = "disconnected";
      this.callbacks.onDisconnected?.(reason);
    });

    // Participant events
    this.room.on(
      ParticipantEvent.TrackMuted,
      (publication: TrackPublication, participant: Participant) => {
        console.log(
          "Participant muted:",
          participant.identity,
          publication.kind
        );
        this.callbacks.onParticipantMuted?.(participant, true);
      }
    );

    this.room.on(
      ParticipantEvent.TrackUnmuted,
      (publication: TrackPublication, participant: Participant) => {
        console.log(
          "Participant unmuted:",
          participant.identity,
          publication.kind
        );
        this.callbacks.onParticipantMuted?.(participant, false);
      }
    );

    // Note: IsSpeakingChanged event no longer exists in current LiveKit version
    // Speaking detection should be handled through audio level monitoring
  }

  // Setup push-to-talk keyboard listeners
  private setupPushToTalkListeners() {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        await this.setMuted(false);
      }
    };

    const handleKeyUp = async (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        await this.setMuted(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Store listeners for cleanup
    this.pushToTalkListeners = { handleKeyDown, handleKeyUp };
  }

  // Remove push-to-talk keyboard listeners
  private removePushToTalkListeners() {
    if (this.pushToTalkListeners) {
      document.removeEventListener(
        "keydown",
        this.pushToTalkListeners.handleKeyDown
      );
      document.removeEventListener(
        "keyup",
        this.pushToTalkListeners.handleKeyUp
      );
      this.pushToTalkListeners = null;
    }
  }

  private pushToTalkListeners: {
    handleKeyDown: (event: KeyboardEvent) => void;
    handleKeyUp: (event: KeyboardEvent) => void;
  } | null = null;
}

// Create singleton instance
export const liveKitService = new LiveKitService();

// React hook for using LiveKit service
export const useLiveKit = () => {
  return {
    liveKitService,
    connect: liveKitService.connect.bind(liveKitService),
    disconnect: liveKitService.disconnect.bind(liveKitService),
    setMuted: liveKitService.setMuted.bind(liveKitService),
    setPushToTalk: liveKitService.setPushToTalk.bind(liveKitService),
    sendData: liveKitService.sendData.bind(liveKitService),
    getRoomStats: liveKitService.getRoomStats.bind(liveKitService),
    getVoiceState: liveKitService.getVoiceState.bind(liveKitService),
    isConnected: liveKitService.isConnected.bind(liveKitService),
    isMuted: liveKitService.isMuted.bind(liveKitService),
    isSpeaking: liveKitService.isSpeaking.bind(liveKitService),
    getParticipants: liveKitService.getParticipants.bind(liveKitService),
    getLocalParticipant:
      liveKitService.getLocalParticipant.bind(liveKitService),
    getRoom: liveKitService.getRoom.bind(liveKitService),
  };
};
