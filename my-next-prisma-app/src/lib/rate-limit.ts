/**
 * Rate Limiting Middleware
 * Protects against brute force, DDoS, and API abuse
 *
 * Uses Redis-backed rate limiter for distributed deployments
 * Falls back to memory storage for development
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

// Initialize Redis client (if available)
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

/**
 * Rate Limiter Configurations
 */
const RATE_LIMITERS = {
  // Global API rate limit: 100 requests per 15 minutes
  api: redisClient
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl_api",
        points: 100,
        duration: 15 * 60,
      })
    : new RateLimiterMemory({
        points: 100,
        duration: 15 * 60,
      }),

  // Authentication: 5 login attempts per 15 minutes
  auth: redisClient
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl_auth",
        points: 5,
        duration: 15 * 60,
        blockDuration: 15 * 60, // Block for 15 minutes after limit
      })
    : new RateLimiterMemory({
        points: 5,
        duration: 15 * 60,
        blockDuration: 15 * 60,
      }),

  // AI Quiz Generation: 10 per hour
  aiQuiz: redisClient
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl_ai",
        points: 10,
        duration: 60 * 60,
      })
    : new RateLimiterMemory({
        points: 10,
        duration: 60 * 60,
      }),

  // File uploads: 20 per hour
  upload: redisClient
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl_upload",
        points: 20,
        duration: 60 * 60,
      })
    : new RateLimiterMemory({
        points: 20,
        duration: 60 * 60,
      }),

  // Password reset: 3 attempts per hour
  passwordReset: redisClient
    ? new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rl_pwd",
        points: 3,
        duration: 60 * 60,
      })
    : new RateLimiterMemory({
        points: 3,
        duration: 60 * 60,
      }),
};

/**
 * Get client identifier (IP address or user ID)
 */
function getClientIdentifier(request: NextRequest): string {
  // Prefer user ID if authenticated
  const userId = request.headers.get("x-user-id");
  if (userId) return `user:${userId}`;

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]?.trim() || "unknown"
    : request.headers.get("x-real-ip") || "unknown";

  return `ip:${ip}`;
}

/**
 * Rate limit middleware factory
 */
export function withRateLimit(limiterType: keyof typeof RATE_LIMITERS = "api") {
  const limiter = RATE_LIMITERS[limiterType];

  return function rateLimitMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const identifier = getClientIdentifier(request);

      try {
        // Consume 1 point
        const rateLimiterRes = await limiter.consume(identifier, 1);

        // Add rate limit headers
        const response = await handler(request);

        response.headers.set("X-RateLimit-Limit", String(limiter.points));
        response.headers.set(
          "X-RateLimit-Remaining",
          String(rateLimiterRes.remainingPoints)
        );
        response.headers.set(
          "X-RateLimit-Reset",
          String(
            new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString()
          )
        );

        return response;
      } catch (rateLimiterRes: unknown) {
        // Rate limit exceeded
        const error = rateLimiterRes as { msBeforeNext: number };
        const response = NextResponse.json(
          {
            error: "Too many requests",
            message: "Rate limit exceeded. Please try again later.",
            retryAfter: Math.ceil(error.msBeforeNext / 1000),
          },
          { status: 429 }
        );

        response.headers.set(
          "Retry-After",
          String(Math.ceil(error.msBeforeNext / 1000))
        );
        response.headers.set("X-RateLimit-Limit", String(limiter.points));
        response.headers.set("X-RateLimit-Remaining", "0");

        return response;
      }
    };
  };
}

/**
 * Check if IP is rate limited (for custom logic)
 */
export async function isRateLimited(
  identifier: string,
  limiterType: keyof typeof RATE_LIMITERS = "api"
): Promise<boolean> {
  const limiter = RATE_LIMITERS[limiterType];

  try {
    await limiter.get(identifier);
    return false;
  } catch {
    return true;
  }
}

/**
 * Reset rate limit for a user (admin action)
 */
export async function resetRateLimit(
  identifier: string,
  limiterType: keyof typeof RATE_LIMITERS = "api"
): Promise<void> {
  const limiter = RATE_LIMITERS[limiterType];
  await limiter.delete(identifier);
}
