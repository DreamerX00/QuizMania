import { LiveKitRoom, Room, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { logger } from '@/utils/logger';

export interface LiveKitHealthConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
  healthCheckInterval: number; // milliseconds
  fallbackTimeout: number; // milliseconds
  maxRetries: number;
}

export interface HealthStatus {
  isHealthy: boolean;
  latency: number;
  lastCheck: Date;
  error?: string;
  fallbackActive: boolean;
}

export interface FallbackConfig {
  enabled: boolean;
  webRTCOnly: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
}

class LiveKitHealthMonitor {
  private config: LiveKitHealthConfig;
  private fallbackConfig: FallbackConfig;
  private healthStatus: HealthStatus;
  private healthCheckInterval?: NodeJS.Timeout;
  private isMonitoring: boolean = false;
  private reconnectAttempts: number = 0;

  constructor(config: LiveKitHealthConfig, fallbackConfig: FallbackConfig) {
    this.config = config;
    this.fallbackConfig = fallbackConfig;
    this.healthStatus = {
      isHealthy: true,
      latency: 0,
      lastCheck: new Date(),
      fallbackActive: false
    };
  }

  /**
   * Start health monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('LiveKit health monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    logger.info('Starting LiveKit health monitoring');

    // Initial health check
    this.performHealthCheck();

    // Set up periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    logger.info('Stopping LiveKit health monitoring');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Perform a health check against LiveKit
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create a test room connection
      const room = new LiveKitRoom();
      
      // Set up connection timeout
      const connectionPromise = room.connect(this.config.url, this.config.apiKey, {
        autoSubscribe: false,
        adaptiveStream: false,
        dynacast: false
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), this.config.fallbackTimeout);
      });

      // Race between connection and timeout
      await Promise.race([connectionPromise, timeoutPromise]);
      
      const latency = Date.now() - startTime;
      
      // Update health status
      this.healthStatus = {
        isHealthy: true,
        latency,
        lastCheck: new Date(),
        fallbackActive: false
      };

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;

      // Disconnect test room
      await room.disconnect();

      logger.debug(`LiveKit health check passed - latency: ${latency}ms`);

    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.healthStatus = {
        isHealthy: false,
        latency,
        lastCheck: new Date(),
        error: errorMessage,
        fallbackActive: this.shouldActivateFallback()
      };

      logger.error(`LiveKit health check failed: ${errorMessage}`);

      // Trigger fallback if needed
      if (this.shouldActivateFallback()) {
        this.activateFallback();
      }
    }
  }

  /**
   * Check if fallback should be activated
   */
  private shouldActivateFallback(): boolean {
    if (!this.fallbackConfig.enabled) {
      return false;
    }

    // Activate fallback if health check failed multiple times
    return this.reconnectAttempts >= this.config.maxRetries;
  }

  /**
   * Activate fallback mode
   */
  private activateFallback(): void {
    if (this.healthStatus.fallbackActive) {
      return; // Already in fallback mode
    }

    logger.warn('Activating LiveKit fallback mode');
    this.healthStatus.fallbackActive = true;

    // Emit fallback event for other services to handle
    this.emitFallbackEvent();
  }

  /**
   * Emit fallback event for other services
   */
  private emitFallbackEvent(): void {
    // This could be replaced with a proper event emitter or message queue
    logger.info('LiveKit fallback mode activated - switching to WebRTC-only mode');
    
    // Notify WebSocket server about fallback mode
    if (typeof window !== 'undefined') {
      // Client-side: emit to WebSocket server
      window.dispatchEvent(new CustomEvent('livekit-fallback', {
        detail: {
          fallbackActive: true,
          timestamp: new Date()
        }
      }));
    } else {
      // Server-side: could emit to Socket.IO or other messaging system
      logger.info('Server-side fallback notification would be sent here');
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Check if LiveKit is healthy
   */
  isHealthy(): boolean {
    return this.healthStatus.isHealthy;
  }

  /**
   * Check if fallback is active
   */
  isFallbackActive(): boolean {
    return this.healthStatus.fallbackActive;
  }

  /**
   * Get current latency
   */
  getLatency(): number {
    return this.healthStatus.latency;
  }

  /**
   * Force a health check
   */
  async forceHealthCheck(): Promise<HealthStatus> {
    await this.performHealthCheck();
    return this.getHealthStatus();
  }

  /**
   * Reset fallback mode
   */
  resetFallback(): void {
    this.healthStatus.fallbackActive = false;
    this.reconnectAttempts = 0;
    logger.info('LiveKit fallback mode reset');
  }
}

// WebRTC Fallback Implementation
export class WebRTCFallback {
  private isActive: boolean = false;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();

  /**
   * Activate WebRTC fallback mode
   */
  activate(): void {
    this.isActive = true;
    logger.info('WebRTC fallback mode activated');
  }

  /**
   * Deactivate WebRTC fallback mode
   */
  deactivate(): void {
    this.isActive = false;
    logger.info('WebRTC fallback mode deactivated');
  }

  /**
   * Check if WebRTC fallback is active
   */
  isActive(): boolean {
    return this.isActive;
  }

  /**
   * Create a WebRTC peer connection for fallback
   */
  createPeerConnection(roomId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnections.set(roomId, peerConnection);
    logger.debug(`Created WebRTC peer connection for room: ${roomId}`);

    return peerConnection;
  }

  /**
   * Remove a WebRTC peer connection
   */
  removePeerConnection(roomId: string): void {
    const peerConnection = this.peerConnections.get(roomId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(roomId);
      logger.debug(`Removed WebRTC peer connection for room: ${roomId}`);
    }
  }

  /**
   * Get all active peer connections
   */
  getPeerConnections(): Map<string, RTCPeerConnection> {
    return new Map(this.peerConnections);
  }
}

// Default configuration
const defaultConfig: LiveKitHealthConfig = {
  url: process.env.LIVEKIT_URL || 'wss://livekit.example.com',
  apiKey: process.env.LIVEKIT_API_KEY || '',
  apiSecret: process.env.LIVEKIT_API_SECRET || '',
  healthCheckInterval: 30000, // 30 seconds
  fallbackTimeout: 5000, // 5 seconds
  maxRetries: 3
};

const defaultFallbackConfig: FallbackConfig = {
  enabled: true,
  webRTCOnly: true,
  reconnectAttempts: 3,
  reconnectDelay: 1000
};

// Singleton instances
let healthMonitor: LiveKitHealthMonitor | null = null;
let webRTCFallback: WebRTCFallback | null = null;

/**
 * Initialize LiveKit health monitoring
 */
export function initializeLiveKitHealth(
  config?: Partial<LiveKitHealthConfig>,
  fallbackConfig?: Partial<FallbackConfig>
): LiveKitHealthMonitor {
  if (healthMonitor) {
    return healthMonitor;
  }

  const finalConfig = { ...defaultConfig, ...config };
  const finalFallbackConfig = { ...defaultFallbackConfig, ...fallbackConfig };

  healthMonitor = new LiveKitHealthMonitor(finalConfig, finalFallbackConfig);
  webRTCFallback = new WebRTCFallback();

  return healthMonitor;
}

/**
 * Get the LiveKit health monitor instance
 */
export function getLiveKitHealthMonitor(): LiveKitHealthMonitor | null {
  return healthMonitor;
}

/**
 * Get the WebRTC fallback instance
 */
export function getWebRTCFallback(): WebRTCFallback | null {
  return webRTCFallback;
}

/**
 * Start LiveKit health monitoring
 */
export function startLiveKitHealthMonitoring(): void {
  const monitor = getLiveKitHealthMonitor();
  if (monitor) {
    monitor.startMonitoring();
  } else {
    logger.error('LiveKit health monitor not initialized');
  }
}

/**
 * Stop LiveKit health monitoring
 */
export function stopLiveKitHealthMonitoring(): void {
  const monitor = getLiveKitHealthMonitor();
  if (monitor) {
    monitor.stopMonitoring();
  }
}

/**
 * Get current LiveKit health status
 */
export function getLiveKitHealthStatus(): HealthStatus | null {
  const monitor = getLiveKitHealthMonitor();
  return monitor ? monitor.getHealthStatus() : null;
}

/**
 * Check if LiveKit is healthy
 */
export function isLiveKitHealthy(): boolean {
  const monitor = getLiveKitHealthMonitor();
  return monitor ? monitor.isHealthy() : false;
}

/**
 * Check if fallback is active
 */
export function isLiveKitFallbackActive(): boolean {
  const monitor = getLiveKitHealthMonitor();
  return monitor ? monitor.isFallbackActive() : false;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Client-side initialization
  initializeLiveKitHealth();
  startLiveKitHealthMonitoring();
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    stopLiveKitHealthMonitoring();
  });

  process.on('SIGINT', () => {
    stopLiveKitHealthMonitoring();
  });
} 