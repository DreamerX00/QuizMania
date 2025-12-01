/**
 * CORS Configuration for Next.js API Routes
 * Restricts cross-origin requests to trusted domains
 *
 * Protects against:
 * - Unauthorized cross-origin API access
 * - CSRF attacks from malicious sites
 * - Data exfiltration
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Allowed origins (whitelist)
 */
const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production"
    ? [
        "https://quizmania.com", // Production domain
        "https://www.quizmania.com",
        "https://app.quizmania.com",
      ]
    : [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001", // WebSocket server
      ];

/**
 * CORS configuration
 */
const CORS_CONFIG = {
  allowedOrigins: ALLOWED_ORIGINS,
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "X-Requested-With",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  credentials: true, // Allow cookies
  maxAge: 86400, // 24 hours preflight cache
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  // Exact match
  if (CORS_CONFIG.allowedOrigins.includes(origin)) {
    return true;
  }

  // In development, allow any localhost
  if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
    return true;
  }

  return false;
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  if (isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      CORS_CONFIG.allowedMethods.join(", ")
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      CORS_CONFIG.allowedHeaders.join(", ")
    );
    response.headers.set(
      "Access-Control-Expose-Headers",
      CORS_CONFIG.exposedHeaders.join(", ")
    );
    response.headers.set("Access-Control-Max-Age", String(CORS_CONFIG.maxAge));
  }

  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");

    if (!isOriginAllowed(origin)) {
      return new NextResponse(null, { status: 403 });
    }

    const response = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(response, origin);
  }

  return null;
}

/**
 * CORS middleware wrapper for API routes
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   return withCors(request, async () => {
 *     const data = await fetchData();
 *     return NextResponse.json(data);
 *   });
 * }
 * ```
 */
export async function withCors(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const origin = request.headers.get("origin");

  // Handle preflight
  const preflightResponse = handleCorsPreFlight(request);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Block requests from disallowed origins
  if (origin && !isOriginAllowed(origin)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Execute handler
  const response = await handler();

  // Apply CORS headers
  return applyCorsHeaders(response, origin);
}

/**
 * WebSocket CORS validation
 * Use this to validate WebSocket upgrade requests
 */
export function validateWebSocketOrigin(origin: string | null): boolean {
  return isOriginAllowed(origin);
}

/**
 * Add origin to whitelist (use with extreme caution)
 */
export function addAllowedOrigin(origin: string): void {
  if (!CORS_CONFIG.allowedOrigins.includes(origin)) {
    CORS_CONFIG.allowedOrigins.push(origin);
  }
}

/**
 * Strict CORS for sensitive endpoints (webhooks, admin)
 * Only allows same-origin requests
 */
export function requireSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Allow requests without Origin header (server-to-server)
  if (!origin) {
    return null;
  }

  // Verify origin matches host
  const originHost = new URL(origin).host;
  if (originHost !== host) {
    return new NextResponse("Forbidden: Cross-origin not allowed", {
      status: 403,
    });
  }

  return null;
}
