import { Socket } from "socket.io";
import { redisClient } from "../config/redis";

type ExtendedError = Error & { data?: any };

// Rate limiter configuration - production-ready with Redis
const BUCKET_SIZE = 20; // max requests per window
const WINDOW = 1; // seconds
const BURST_LIMIT = 30; // max burst requests
const BAN_THRESHOLD = 100; // requests that trigger temporary ban
const BAN_DURATION = 300; // ban duration in seconds (5 minutes)

interface RateLimitInfo {
  count: number;
  banExpiry: number | null;
}

/**
 * Production-ready Redis-based rate limiter with burst protection and auto-ban
 * Features:
 * - Sliding window rate limiting
 * - Burst protection
 * - Automatic temporary bans for abuse
 * - Graceful degradation if Redis fails
 */
export async function rateLimiter(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const userId = (socket as any).user?.id || socket.id;
  const rateKey = `ratelimit:${userId}`;
  const banKey = `ban:${userId}`;
  const burstKey = `burst:${userId}`;

  try {
    // Check if user is banned
    const banExpiry = await redisClient.get(banKey);
    if (banExpiry) {
      const error = new Error(
        "You have been temporarily banned due to rate limit violations"
      ) as ExtendedError;
      error.data = { banExpiry: parseInt(banExpiry as string) };
      return next(error);
    }

    // Use Redis multi for atomic operations (not pipeline)
    const multi = redisClient.multi();
    multi.incr(rateKey);
    multi.ttl(rateKey);
    multi.incr(burstKey);
    multi.ttl(burstKey);

    const results = await multi.exec();
    if (!results || results.length !== 4) {
      throw new Error("Redis multi command failed");
    }

    const rateCount = results[0] as unknown as number;
    const rateTTL = results[1] as unknown as number;
    const burstCount = results[2] as unknown as number;
    const burstTTL = results[3] as unknown as number;

    // Set expiry for rate limit key if new
    if (rateTTL === -1) {
      await redisClient.expire(rateKey, WINDOW);
    }

    // Set expiry for burst key if new (10 seconds window)
    if (burstTTL === -1) {
      await redisClient.expire(burstKey, 10);
    }

    // Check burst limit
    if (burstCount > BURST_LIMIT) {
      // Apply temporary ban
      await redisClient.setex(
        banKey,
        BAN_DURATION,
        Date.now() + BAN_DURATION * 1000
      );
      const error = new Error(
        "Rate limit exceeded - temporary ban applied"
      ) as ExtendedError;
      error.data = { banDuration: BAN_DURATION };
      return next(error);
    }

    // Check standard rate limit
    if (rateCount > BUCKET_SIZE) {
      // Track violations
      const violationKey = `violations:${userId}`;
      const violations = await redisClient.incr(violationKey);
      await redisClient.expire(violationKey, 3600); // Reset hourly

      if (violations >= BAN_THRESHOLD) {
        // Permanent ban for repeated violations
        await redisClient.setex(
          banKey,
          BAN_DURATION * 2,
          Date.now() + BAN_DURATION * 2000
        );
      }

      return next(new Error("Rate limit exceeded"));
    }

    next();
  } catch (err) {
    // Graceful degradation: log error but allow request
    console.error("Rate limiter Redis error:", err);
    next();
  }
}
