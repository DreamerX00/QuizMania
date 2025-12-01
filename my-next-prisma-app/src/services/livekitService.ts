import { AccessToken, VideoGrant } from "livekit-server-sdk";

// LiveKit configuration
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

// Health check configuration
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const FALLBACK_THRESHOLD = 3; // Number of failed health checks before fallback
const FALLBACK_COOLDOWN = 60000; // 1 minute cooldown before retrying LiveKit

interface LiveKitHealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  consecutiveFailures: number;
  lastError?: string;
  fallbackActive: boolean;
  fallbackSince?: Date;
}

class LiveKitService {
  private healthStatus: LiveKitHealthStatus = {
    isHealthy: true,
    lastCheck: new Date(),
    consecutiveFailures: 0,
    fallbackActive: false,
  };

  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.startHealthCheck();
  }

  /**
   * Generate LiveKit access token for a user
   */
  async generateToken(
    userId: string,
    roomName: string,
    options?: {
      canPublish?: boolean;
      canSubscribe?: boolean;
      canPublishData?: boolean;
      metadata?: string;
    }
  ): Promise<string> {
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      throw new Error("LiveKit API credentials not configured");
    }

    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      metadata: options?.metadata || "",
    });

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: options?.canPublish ?? true,
      canSubscribe: options?.canSubscribe ?? true,
      canPublishData: options?.canPublishData ?? true,
    };

    token.addGrant(grant);
    return token.toJwt();
  }

  /**
   * Check if LiveKit is healthy and available
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Simple health check - try to generate a test token
      await this.generateToken("health-check", "test-room");

      // If we reach here, LiveKit is healthy
      this.healthStatus.isHealthy = true;
      this.healthStatus.consecutiveFailures = 0;
      this.healthStatus.lastError = undefined;

      // If fallback was active, check if we can switch back
      if (this.healthStatus.fallbackActive) {
        const fallbackDuration =
          Date.now() - (this.healthStatus.fallbackSince?.getTime() || 0);
        if (fallbackDuration > FALLBACK_COOLDOWN) {
          this.healthStatus.fallbackActive = false;
          this.healthStatus.fallbackSince = undefined;
          console.log("LiveKit recovered, switching back from fallback mode");
        }
      }

      return true;
    } catch (error) {
      this.healthStatus.isHealthy = false;
      this.healthStatus.consecutiveFailures++;
      this.healthStatus.lastError =
        error instanceof Error ? error.message : "Unknown error";

      // Activate fallback if threshold is reached
      if (
        this.healthStatus.consecutiveFailures >= FALLBACK_THRESHOLD &&
        !this.healthStatus.fallbackActive
      ) {
        this.healthStatus.fallbackActive = true;
        this.healthStatus.fallbackSince = new Date();
        console.warn("LiveKit health check failed, activating fallback mode");
      }

      return false;
    } finally {
      this.healthStatus.lastCheck = new Date();
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): LiveKitHealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Check if fallback mode is active
   */
  isFallbackActive(): boolean {
    return this.healthStatus.fallbackActive;
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkHealth();
    }, HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stop health checks (for cleanup)
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Force fallback mode (for testing or manual override)
   */
  forceFallback(): void {
    this.healthStatus.fallbackActive = true;
    this.healthStatus.fallbackSince = new Date();
    console.log("LiveKit fallback mode forced manually");
  }

  /**
   * Reset fallback mode (for testing or manual override)
   */
  resetFallback(): void {
    this.healthStatus.fallbackActive = false;
    this.healthStatus.fallbackSince = undefined;
    this.healthStatus.consecutiveFailures = 0;
    console.log("LiveKit fallback mode reset manually");
  }
}

// Export singleton instance
export const livekitService = new LiveKitService();

// Export types for use in other modules
export type { LiveKitHealthStatus };
