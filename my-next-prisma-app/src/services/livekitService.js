"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.livekitService = void 0;
const livekit_server_sdk_1 = require("livekit-server-sdk");
// LiveKit configuration
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://livekit.example.com';
// Health check configuration
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const FALLBACK_THRESHOLD = 3; // Number of failed health checks before fallback
const FALLBACK_COOLDOWN = 60000; // 1 minute cooldown before retrying LiveKit
class LiveKitService {
    constructor() {
        this.healthStatus = {
            isHealthy: true,
            lastCheck: new Date(),
            consecutiveFailures: 0,
            fallbackActive: false
        };
        this.startHealthCheck();
    }
    /**
     * Generate LiveKit access token for a user
     */
    async generateToken(userId, roomName, options) {
        var _a, _b, _c;
        if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
            throw new Error('LiveKit API credentials not configured');
        }
        const token = new livekit_server_sdk_1.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: userId,
            metadata: (options === null || options === void 0 ? void 0 : options.metadata) || ''
        });
        const grant = {
            room: roomName,
            roomJoin: true,
            canPublish: (_a = options === null || options === void 0 ? void 0 : options.canPublish) !== null && _a !== void 0 ? _a : true,
            canSubscribe: (_b = options === null || options === void 0 ? void 0 : options.canSubscribe) !== null && _b !== void 0 ? _b : true,
            canPublishData: (_c = options === null || options === void 0 ? void 0 : options.canPublishData) !== null && _c !== void 0 ? _c : true,
        };
        token.addGrant(grant);
        return token.toJwt();
    }
    /**
     * Check if LiveKit is healthy and available
     */
    async checkHealth() {
        var _a;
        try {
            // Simple health check - try to generate a test token
            await this.generateToken('health-check', 'test-room');
            // If we reach here, LiveKit is healthy
            this.healthStatus.isHealthy = true;
            this.healthStatus.consecutiveFailures = 0;
            this.healthStatus.lastError = undefined;
            // If fallback was active, check if we can switch back
            if (this.healthStatus.fallbackActive) {
                const fallbackDuration = Date.now() - (((_a = this.healthStatus.fallbackSince) === null || _a === void 0 ? void 0 : _a.getTime()) || 0);
                if (fallbackDuration > FALLBACK_COOLDOWN) {
                    this.healthStatus.fallbackActive = false;
                    this.healthStatus.fallbackSince = undefined;
                    console.log('LiveKit recovered, switching back from fallback mode');
                }
            }
            return true;
        }
        catch (error) {
            this.healthStatus.isHealthy = false;
            this.healthStatus.consecutiveFailures++;
            this.healthStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
            // Activate fallback if threshold is reached
            if (this.healthStatus.consecutiveFailures >= FALLBACK_THRESHOLD && !this.healthStatus.fallbackActive) {
                this.healthStatus.fallbackActive = true;
                this.healthStatus.fallbackSince = new Date();
                console.warn('LiveKit health check failed, activating fallback mode');
            }
            return false;
        }
        finally {
            this.healthStatus.lastCheck = new Date();
        }
    }
    /**
     * Get current health status
     */
    getHealthStatus() {
        return Object.assign({}, this.healthStatus);
    }
    /**
     * Check if fallback mode is active
     */
    isFallbackActive() {
        return this.healthStatus.fallbackActive;
    }
    /**
     * Start periodic health checks
     */
    startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            await this.checkHealth();
        }, HEALTH_CHECK_INTERVAL);
    }
    /**
     * Stop health checks (for cleanup)
     */
    stopHealthCheck() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
    }
    /**
     * Force fallback mode (for testing or manual override)
     */
    forceFallback() {
        this.healthStatus.fallbackActive = true;
        this.healthStatus.fallbackSince = new Date();
        console.log('LiveKit fallback mode forced manually');
    }
    /**
     * Reset fallback mode (for testing or manual override)
     */
    resetFallback() {
        this.healthStatus.fallbackActive = false;
        this.healthStatus.fallbackSince = undefined;
        this.healthStatus.consecutiveFailures = 0;
        console.log('LiveKit fallback mode reset manually');
    }
}
// Export singleton instance
exports.livekitService = new LiveKitService();
