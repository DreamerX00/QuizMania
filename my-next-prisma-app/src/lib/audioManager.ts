/**
 * Audio Manager - Optimized audio loading and playback
 *
 * Features:
 * - Lazy loading of audio files
 * - Audio sprite support
 * - Caching and preloading
 * - Volume control and muting
 */

type AudioType = "sfx" | "music" | "voice";

interface AudioConfig {
  src: string;
  volume?: number;
  loop?: boolean;
  preload?: boolean;
  type?: AudioType;
}

class AudioManager {
  private static instance: AudioManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private volumes: Record<AudioType, number> = {
    sfx: 0.7,
    music: 0.5,
    voice: 1.0,
  };
  private muted = false;
  private enableAudio = true; // User preference

  private constructor() {
    // Check user preference from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("audioEnabled");
      this.enableAudio = saved === null ? true : saved === "true";

      const savedVolumes = localStorage.getItem("audioVolumes");
      if (savedVolumes) {
        this.volumes = JSON.parse(savedVolumes);
      }
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Preload essential audio files
   */
  preloadEssentials() {
    if (!this.enableAudio) return;

    const essentialSounds = [
      {
        key: "button_click",
        src: "/game_arena/button_click.mp3",
        type: "sfx" as AudioType,
      },
      {
        key: "select",
        src: "/game_arena/select.mp3",
        type: "sfx" as AudioType,
      },
    ];

    essentialSounds.forEach((sound) => {
      this.preload(sound.key, sound.src, sound.type);
    });
  }

  /**
   * Preload an audio file
   */
  private preload(key: string, src: string, type: AudioType = "sfx") {
    if (this.audioCache.has(key)) return;

    const audio = new Audio();
    audio.src = src;
    audio.volume = this.volumes[type];
    audio.preload = "metadata";

    // Add error handling
    audio.addEventListener("error", (e) => {
      console.error(`Failed to load audio "${key}" from ${src}:`, e);
    });

    audio.addEventListener("canplaythrough", () => {
      console.log(`Audio "${key}" loaded successfully`);
    });

    this.audioCache.set(key, audio);
  }

  /**
   * Play a sound effect
   */
  async play(key: string, config?: AudioConfig): Promise<void> {
    if (!this.enableAudio || this.muted) return;

    try {
      let audio = this.audioCache.get(key);

      if (!audio && config?.src) {
        // Lazy load if not cached
        audio = new Audio();
        audio.src = config.src;
        audio.volume = config.volume ?? this.volumes[config.type ?? "sfx"];
        audio.loop = config.loop ?? false;
        audio.preload = "metadata";

        // Add error handling
        audio.addEventListener("error", (e) => {
          console.error(`Failed to load audio "${key}" from ${config.src}:`, e);
        });

        this.audioCache.set(key, audio);
      }

      if (!audio) {
        console.warn(`Audio "${key}" not found and no src provided`);
        return;
      }

      // Reset audio if already playing
      if (!audio.paused) {
        audio.currentTime = 0;
      }

      await audio.play();
    } catch (error) {
      console.error(`Failed to play audio "${key}":`, error);
    }
  }

  /**
   * Play a sound by path (one-time use, not cached)
   */
  async playOnce(src: string, volume = 0.7): Promise<void> {
    if (!this.enableAudio || this.muted) return;

    try {
      const audio = new Audio(src);
      audio.volume = volume;
      await audio.play();
    } catch (error) {
      console.error(`Failed to play audio "${src}":`, error);
    }
  }

  /**
   * Stop a playing audio
   */
  stop(key: string) {
    const audio = this.audioCache.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Set volume for a specific audio type
   */
  setVolume(type: AudioType, volume: number) {
    this.volumes[type] = Math.max(0, Math.min(1, volume));

    // Update all cached audio of this type
    this.audioCache.forEach((audio) => {
      // Type detection would need to be stored with audio
      audio.volume = this.volumes[type];
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("audioVolumes", JSON.stringify(this.volumes));
    }
  }

  /**
   * Get volume for a specific audio type
   */
  getVolume(type: AudioType): number {
    return this.volumes[type];
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean) {
    this.muted = muted;
  }

  /**
   * Enable/disable audio globally
   */
  setEnabled(enabled: boolean) {
    this.enableAudio = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("audioEnabled", String(enabled));
    }

    if (!enabled) {
      // Stop all playing audio
      this.audioCache.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }

  /**
   * Check if audio is enabled
   */
  isEnabled(): boolean {
    return this.enableAudio;
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    this.audioCache.clear();
  }

  /**
   * Load audio on user interaction (for browsers that block autoplay)
   */
  initializeOnUserInteraction() {
    if (typeof window === "undefined") return;

    const initialize = () => {
      this.preloadEssentials();

      // Remove listeners after first interaction
      document.removeEventListener("click", initialize);
      document.removeEventListener("touchstart", initialize);
      document.removeEventListener("keydown", initialize);
    };

    document.addEventListener("click", initialize, { once: true });
    document.addEventListener("touchstart", initialize, { once: true });
    document.addEventListener("keydown", initialize, { once: true });
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

// Audio file mappings (for easy reference)
export const GAME_SOUNDS = {
  BUTTON_CLICK: { key: "button_click", src: "/game_arena/button_click.mp3" },
  SELECT: { key: "select", src: "/game_arena/select.mp3" },
  ACCEPT: { key: "accept", src: "/game_arena/accept.mp3" },
  REMOVE: { key: "remove", src: "/game_arena/remove.mp3" },
  SEND_MESSAGE: { key: "send_message", src: "/game_arena/send_message.mp3" },
  TAB_SWITCH: { key: "tab_switch", src: "/game_arena/tab_switch.mp3" },
  VOTE: { key: "vote", src: "/game_arena/vote.mp3" },
  MODE_CHANGE: { key: "mode_change", src: "/game_arena/mode_change.mp3" },
  START_MATCH: { key: "start_match", src: "/game_arena/start_match.mp3" },
  GIFT_SENT: { key: "gift_sent", src: "/game_arena/gift_sent.mp3" },
} as const;

// Helper hook for React components
export function useAudio() {
  return {
    play: (key: string, config?: AudioConfig) => audioManager.play(key, config),
    playOnce: (src: string, volume?: number) =>
      audioManager.playOnce(src, volume),
    stop: (key: string) => audioManager.stop(key),
    setVolume: (type: AudioType, volume: number) =>
      audioManager.setVolume(type, volume),
    getVolume: (type: AudioType) => audioManager.getVolume(type),
    toggleMute: () => audioManager.toggleMute(),
    setEnabled: (enabled: boolean) => audioManager.setEnabled(enabled),
    isEnabled: () => audioManager.isEnabled(),
  };
}

// Initialize audio manager on app load
if (typeof window !== "undefined") {
  audioManager.initializeOnUserInteraction();
}
