import { z } from "zod";

/**
 * Environment variable validation schema
 * Validates all required environment variables at application startup
 * Provides type-safe access to env vars
 */

// Check if we're in browser environment
const isBrowser = typeof window !== "undefined";

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database Configuration (Server-only)
  DATABASE_URL: isBrowser
    ? z.string().optional()
    : z.string().min(1, "DATABASE_URL is required"),
  DIRECT_DATABASE_URL: isBrowser
    ? z.string().optional()
    : z.string().min(1, "DIRECT_DATABASE_URL is required"),

  // NextAuth Configuration (Server-only)
  NEXTAUTH_SECRET: isBrowser
    ? z.string().optional()
    : z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().optional(),

  // OAuth Providers (Server-only)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Public URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // AI Provider API Keys (Optional - for AI Quiz Generation) (Server-only)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Payment Gateway (Razorpay) (Server-only secrets)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PLATFORM_ACCOUNT_ID: z.string().optional(),

  // WebSocket Server
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  WS_PORT: isBrowser
    ? z.string().optional()
    : z.string().regex(/^\d+$/).transform(Number).default("3001"),

  // LiveKit Configuration (Optional - for voice chat)
  NEXT_PUBLIC_LIVEKIT_URL: z.string().url().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),

  // Redis Configuration (Server-only)
  REDIS_URL: isBrowser
    ? z.string().optional()
    : z.string().default("redis://localhost:6379"),
  REDIS_PORT: isBrowser
    ? z.string().optional()
    : z.string().regex(/^\d+$/).transform(Number).default("6379"),

  // Clerk Authentication (Legacy - for WebSocket server) (Server-only)
  CLERK_JWT_ISSUER: z.string().url().optional(),
  CLERK_AUTHORIZED_PARTIES: z.string().optional(),

  // Vote Throttling (Server-only)
  VOTE_THROTTLE_WINDOW_MS: isBrowser
    ? z.string().optional()
    : z.string().regex(/^\d+$/).transform(Number).default("2000"),

  // Room Configuration (TTL in seconds) (Server-only)
  ROOM_TTL_MATCH: isBrowser
    ? z.string().optional()
    : z.string().regex(/^\d+$/).transform(Number).default("300"),
  ROOM_TTL_CLAN: isBrowser
    ? z.string().optional()
    : z.string().regex(/^\d+$/).transform(Number).default("2592000"),
  ROOM_TTL_CUSTOM: isBrowser
    ? z.string().optional()
    : z.string().regex(/^\d+$/).transform(Number).default("3600"),

  // Vercel Cron Jobs Security (Production Only) (Server-only)
  CRON_SECRET: z.string().optional(),
});

// Parse and validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment variable validation failed:");
    console.error("Missing or invalid environment variables:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    console.error("\n💡 Check your .env file against env.example");
    process.exit(1);
  }
  throw error;
}

// Validate conditional requirements (Server-only)
if (!isBrowser && env.NODE_ENV === "production") {
  if (!env.NEXTAUTH_URL) {
    console.error("❌ NEXTAUTH_URL is required in production environment");
    process.exit(1);
  }

  if (!env.NEXT_PUBLIC_APP_URL) {
    console.warn(
      "⚠️  NEXT_PUBLIC_APP_URL not set - invite links may not work correctly"
    );
  }

  if (!env.CRON_SECRET) {
    console.warn("⚠️  CRON_SECRET not set - cron endpoints are not secured");
  }
}

// Log validation success in development (Server-only)
if (!isBrowser && env.NODE_ENV === "development") {
  console.log("✅ Environment variables validated successfully");
}

// Export validated environment variables
export default env;
export { env };

// Export type for TypeScript
export type Env = typeof env;
