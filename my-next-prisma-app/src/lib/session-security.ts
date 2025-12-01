/**
 * Session Security Configuration
 * Secure cookie settings for authentication tokens
 *
 * Protects against:
 * - Session hijacking
 * - XSS-based cookie theft
 * - CSRF attacks
 * - Man-in-the-middle attacks
 */

export const COOKIE_CONFIG = {
  /**
   * Session cookie configuration (for custom sessions)
   * Clerk manages its own cookies - these are for custom session data
   */
  session: {
    name: "__session",
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax" as const, // CSRF protection (allows navigation)
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  },

  /**
   * CSRF token cookie (readable by JavaScript for X-CSRF-Token header)
   */
  csrf: {
    name: "__csrf",
    httpOnly: false, // Must be readable by client
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const, // Strict for CSRF token
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  },

  /**
   * Remember me cookie (optional long-lived session)
   */
  rememberMe: {
    name: "__remember",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  },

  /**
   * Analytics/tracking cookie (GDPR compliant)
   */
  analytics: {
    name: "__analytics",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  },
} as const;

/**
 * Serialize cookie with secure settings
 */
export function serializeCookie(
  name: string,
  value: string,
  options: Partial<typeof COOKIE_CONFIG.session> = {}
): string {
  const config = { ...COOKIE_CONFIG.session, ...options };

  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${config.path}`,
    `Max-Age=${config.maxAge}`,
    `SameSite=${config.sameSite}`,
  ];

  if (config.httpOnly) parts.push("HttpOnly");
  if (config.secure) parts.push("Secure");

  return parts.join("; ");
}

/**
 * Clear cookie (for logout)
 */
export function clearCookie(name: string): string {
  return serializeCookie(name, "", { maxAge: 0 });
}

/**
 * Clerk environment configuration
 * Ensures Clerk uses secure cookie settings
 */
export const CLERK_CONFIG = {
  /**
   * Frontend API endpoint (from env)
   */
  frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,

  /**
   * Sign in/up URLs
   */
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",

  /**
   * After auth redirect
   */
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/dashboard",

  /**
   * Cookie security settings (Clerk auto-configures these)
   * These are documentation - Clerk manages cookies internally
   */
  cookies: {
    // Clerk automatically uses:
    // - HttpOnly for session tokens
    // - Secure in production
    // - SameSite=Lax
    // - CSRF protection via state parameter
  },
} as const;

/**
 * Recommended Next.js config for secure cookies
 * Add to next.config.mjs
 */
export const NEXTJS_COOKIE_CONFIG = {
  /**
   * Add to next.config.mjs:
   *
   * experimental: {
   *   serverActions: {
   *     bodySizeLimit: '2mb',
   *   },
   * },
   *
   * headers: async () => [
   *   {
   *     source: '/:path*',
   *     headers: [
   *       {
   *         key: 'Set-Cookie',
   *         value: '__Host-session=...; Secure; HttpOnly; SameSite=Strict; Path=/',
   *       },
   *     ],
   *   },
   * ],
   */
};

/**
 * Session timeout configuration
 */
export const SESSION_TIMEOUTS = {
  /**
   * Idle timeout (inactivity)
   */
  idle: 30 * 60 * 1000, // 30 minutes

  /**
   * Absolute timeout (max session duration)
   */
  absolute: 12 * 60 * 60 * 1000, // 12 hours

  /**
   * Remember me duration
   */
  rememberMe: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * Check if session is expired
 */
export function isSessionExpired(
  lastActivity: Date,
  sessionStart: Date,
  rememberMe = false
): boolean {
  const now = Date.now();
  const lastActivityTime = lastActivity.getTime();
  const sessionStartTime = sessionStart.getTime();

  // Check idle timeout
  if (now - lastActivityTime > SESSION_TIMEOUTS.idle) {
    return true;
  }

  // Check absolute timeout (unless remember me)
  if (!rememberMe && now - sessionStartTime > SESSION_TIMEOUTS.absolute) {
    return true;
  }

  // Check remember me duration
  if (rememberMe && now - sessionStartTime > SESSION_TIMEOUTS.rememberMe) {
    return true;
  }

  return false;
}

/**
 * Update session activity timestamp
 * Call this on each authenticated request
 */
export function updateSessionActivity(sessionId: string): void {
  // Implementation depends on your session store (Redis, database, etc.)
  // Example:
  // await redis.set(`session:${sessionId}:lastActivity`, Date.now());
  console.log(`Session ${sessionId} activity updated`);
}
