/**
 * Security Headers Middleware
 * Implements comprehensive security headers for Next.js 15
 * Equivalent to Helmet.js for Express
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Content Security Policy
 * Prevents XSS by whitelisting trusted sources
 *
 * Adjust based on your CDN, analytics, and third-party services
 */
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.razorpay.com wss: https://api.openai.com https://api.anthropic.com",
  "frame-src 'self' https://*.razorpay.com https://challenges.cloudflare.com",
  "frame-ancestors 'none'", // Prevent clickjacking
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = response.headers;

  // Content Security Policy
  headers.set("Content-Security-Policy", CSP_POLICY);

  // Prevent Clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection (legacy browsers)
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy (privacy)
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (disable unnecessary features)
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );

  // HSTS (Force HTTPS) - only in production
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Prevent caching of sensitive responses
  if (response.headers.get("Cache-Control") === null) {
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
  }

  // Remove potentially revealing headers
  headers.delete("X-Powered-By");
  headers.delete("Server");

  return response;
}

/**
 * Security Headers Middleware
 * Use in middleware.ts or wrap API routes
 */
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);
    return applySecurityHeaders(response);
  };
}
