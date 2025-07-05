import { Redis } from 'ioredis';
import { logger } from '@/utils/logger';

export interface PremiumStatus {
  userId: string;
  isPremium: boolean;
  accountType: 'FREE' | 'PREMIUM' | 'LIFETIME';
  premiumUntil?: Date;
  features: string[];
  lastUpdated: Date;
}

export interface PremiumCacheConfig {
  redisUrl: string;
  ttl: number; // seconds
  fallbackEnabled: boolean;
  webhookSecret?: string;
}

export interface PremiumFeatures {
  multiplayerLimit: number;
  matchTypes: string[];
  clanCreation: boolean;
  analyticsAccess: boolean;
  avatarCustomization: boolean;
  dailyRewards: boolean;
}

class PremiumCacheService {
  private redis: Redis;
  private config: PremiumCacheConfig;
  private isConnected: boolean = false;

  constructor(config: PremiumCacheConfig) {
    this.config = config;
    this.redis = new Redis(config.redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.setupRedisListeners();
  }

  /**
   * Setup Redis connection listeners
   */
  private setupRedisListeners(): void {
    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Premium cache Redis connected');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Premium cache Redis error:', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Premium cache Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Premium cache Redis reconnecting...');
    });
  }

  /**
   * Get premium status for a user
   */
  async getPremiumStatus(userId: string): Promise<PremiumStatus | null> {
    try {
      if (this.isConnected) {
        // Try to get from cache first
        const cached = await this.redis.get(`premium:${userId}`);
        if (cached) {
          const status = JSON.parse(cached) as PremiumStatus;
          status.lastUpdated = new Date(status.lastUpdated);
          if (status.premiumUntil) {
            status.premiumUntil = new Date(status.premiumUntil);
          }
          logger.debug(`Premium status cached for user: ${userId}`);
          return status;
        }
      }

      // Fallback to API if Redis is down or cache miss
      if (this.config.fallbackEnabled) {
        return await this.fetchFromAPI(userId);
      }

      return null;
    } catch (error) {
      logger.error(`Error getting premium status for user ${userId}:`, error);
      
      // Fallback to API on error
      if (this.config.fallbackEnabled) {
        return await this.fetchFromAPI(userId);
      }
      
      return null;
    }
  }

  /**
   * Set premium status in cache
   */
  async setPremiumStatus(userId: string, status: PremiumStatus): Promise<void> {
    try {
      if (this.isConnected) {
        const cacheKey = `premium:${userId}`;
        const cacheValue = JSON.stringify(status);
        
        await this.redis.setex(cacheKey, this.config.ttl, cacheValue);
        logger.debug(`Premium status cached for user: ${userId}`);
      }
    } catch (error) {
      logger.error(`Error setting premium status for user ${userId}:`, error);
    }
  }

  /**
   * Invalidate premium status cache
   */
  async invalidatePremiumStatus(userId: string): Promise<void> {
    try {
      if (this.isConnected) {
        await this.redis.del(`premium:${userId}`);
        logger.debug(`Premium status cache invalidated for user: ${userId}`);
      }
    } catch (error) {
      logger.error(`Error invalidating premium status for user ${userId}:`, error);
    }
  }

  /**
   * Fetch premium status from API (fallback)
   */
  private async fetchFromAPI(userId: string): Promise<PremiumStatus | null> {
    try {
      // This would typically call your database or external API
      const response = await fetch(`/api/users/${userId}/premium-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const status = await response.json() as PremiumStatus;
      
      // Cache the result if Redis is available
      if (this.isConnected) {
        await this.setPremiumStatus(userId, status);
      }

      logger.debug(`Premium status fetched from API for user: ${userId}`);
      return status;
    } catch (error) {
      logger.error(`Error fetching premium status from API for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Check if user has premium access
   */
  async isPremium(userId: string): Promise<boolean> {
    const status = await this.getPremiumStatus(userId);
    if (!status) {
      return false;
    }

    // Check if premium has expired
    if (status.premiumUntil && new Date() > status.premiumUntil) {
      // Premium expired, update cache
      const expiredStatus: PremiumStatus = {
        ...status,
        isPremium: false,
        accountType: 'FREE',
        premiumUntil: undefined,
        lastUpdated: new Date()
      };
      await this.setPremiumStatus(userId, expiredStatus);
      return false;
    }

    return status.isPremium;
  }

  /**
   * Get premium features for a user
   */
  async getPremiumFeatures(userId: string): Promise<PremiumFeatures> {
    const isPremium = await this.isPremium(userId);
    
    if (isPremium) {
      return {
        multiplayerLimit: 50,
        matchTypes: ['MCQ', 'TrueFalse', 'MatchPairs', 'Audio', 'Essay', 'Puzzle', 'LiveVideo'],
        clanCreation: true,
        analyticsAccess: true,
        avatarCustomization: true,
        dailyRewards: true
      };
    } else {
      return {
        multiplayerLimit: 2,
        matchTypes: ['MCQ', 'TrueFalse', 'MatchPairs'],
        clanCreation: false,
        analyticsAccess: false,
        avatarCustomization: false,
        dailyRewards: false
      };
    }
  }

  /**
   * Handle webhook for premium status updates
   */
  async handleWebhookUpdate(payload: any, signature?: string): Promise<boolean> {
    try {
      // Verify webhook signature if secret is configured
      if (this.config.webhookSecret && signature) {
        const isValid = this.verifyWebhookSignature(payload, signature);
        if (!isValid) {
          logger.error('Invalid webhook signature');
          return false;
        }
      }

      const { userId, premiumStatus } = payload;
      
      if (!userId || !premiumStatus) {
        logger.error('Invalid webhook payload');
        return false;
      }

      // Update cache with new status
      await this.setPremiumStatus(userId, {
        ...premiumStatus,
        lastUpdated: new Date()
      });

      logger.info(`Premium status updated via webhook for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error handling webhook update:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.config.webhookSecret) {
      return false;
    }

    // This is a simplified example - implement proper signature verification
    // based on your webhook provider (Stripe, Razorpay, etc.)
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Bulk update premium statuses
   */
  async bulkUpdatePremiumStatuses(updates: Array<{ userId: string; status: PremiumStatus }>): Promise<void> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping bulk update');
        return;
      }

      const pipeline = this.redis.pipeline();
      
      for (const { userId, status } of updates) {
        const cacheKey = `premium:${userId}`;
        const cacheValue = JSON.stringify(status);
        pipeline.setex(cacheKey, this.config.ttl, cacheValue);
      }

      await pipeline.exec();
      logger.info(`Bulk updated premium status for ${updates.length} users`);
    } catch (error) {
      logger.error('Error in bulk premium status update:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    connected: boolean;
    keysCount: number;
    memoryUsage: string;
  }> {
    try {
      if (!this.isConnected) {
        return {
          connected: false,
          keysCount: 0,
          memoryUsage: '0'
        };
      }

      const [keysCount, memoryInfo] = await Promise.all([
        this.redis.dbsize(),
        this.redis.memory('USAGE')
      ]);

      return {
        connected: true,
        keysCount,
        memoryUsage: memoryInfo || '0'
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        connected: false,
        keysCount: 0,
        memoryUsage: '0'
      };
    }
  }

  /**
   * Clear all premium cache
   */
  async clearCache(): Promise<void> {
    try {
      if (this.isConnected) {
        const keys = await this.redis.keys('premium:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
          logger.info(`Cleared ${keys.length} premium cache entries`);
        }
      }
    } catch (error) {
      logger.error('Error clearing premium cache:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Premium cache Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
}

// Default configuration
const defaultConfig: PremiumCacheConfig = {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: 3600, // 1 hour
  fallbackEnabled: true,
  webhookSecret: process.env.WEBHOOK_SECRET
};

// Singleton instance
let premiumCacheService: PremiumCacheService | null = null;

/**
 * Initialize premium cache service
 */
export function initializePremiumCache(config?: Partial<PremiumCacheConfig>): PremiumCacheService {
  if (premiumCacheService) {
    return premiumCacheService;
  }

  const finalConfig = { ...defaultConfig, ...config };
  premiumCacheService = new PremiumCacheService(finalConfig);

  return premiumCacheService;
}

/**
 * Get the premium cache service instance
 */
export function getPremiumCacheService(): PremiumCacheService | null {
  return premiumCacheService;
}

/**
 * Get premium status for a user
 */
export async function getPremiumStatus(userId: string): Promise<PremiumStatus | null> {
  const service = getPremiumCacheService();
  return service ? service.getPremiumStatus(userId) : null;
}

/**
 * Check if user has premium access
 */
export async function isPremium(userId: string): Promise<boolean> {
  const service = getPremiumCacheService();
  return service ? service.isPremium(userId) : false;
}

/**
 * Get premium features for a user
 */
export async function getPremiumFeatures(userId: string): Promise<PremiumFeatures> {
  const service = getPremiumCacheService();
  return service ? service.getPremiumFeatures(userId) : {
    multiplayerLimit: 2,
    matchTypes: ['MCQ', 'TrueFalse', 'MatchPairs'],
    clanCreation: false,
    analyticsAccess: false,
    avatarCustomization: false,
    dailyRewards: false
  };
}

/**
 * Handle webhook update
 */
export async function handlePremiumWebhook(payload: any, signature?: string): Promise<boolean> {
  const service = getPremiumCacheService();
  return service ? service.handleWebhookUpdate(payload, signature) : false;
}

/**
 * Invalidate premium status cache
 */
export async function invalidatePremiumStatus(userId: string): Promise<void> {
  const service = getPremiumCacheService();
  if (service) {
    await service.invalidatePremiumStatus(userId);
  }
}

// Auto-initialize if Redis URL is available
if (process.env.REDIS_URL) {
  initializePremiumCache();
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    const service = getPremiumCacheService();
    if (service) {
      await service.close();
    }
  });

  process.on('SIGINT', async () => {
    const service = getPremiumCacheService();
    if (service) {
      await service.close();
    }
  });
} 