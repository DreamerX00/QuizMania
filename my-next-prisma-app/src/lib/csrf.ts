/**
 * CSRF Protection Middleware
 * Implements Double-Submit Cookie pattern for CSRF protection
 *
 * How it works:
 * 1. Server generates CSRF token and sets it as httpOnly cookie
 * 2. Client reads token from non-httpOnly cookie or header
 * 3. Client sends token in request header
 * 4. Server validates both tokens match
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("base64url");
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // GET, HEAD, OPTIONS are safe methods - skip CSRF check
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Both tokens must exist and match
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Also set readable cookie for client-side access
  response.cookies.set({
    name: `${CSRF_COOKIE_NAME}-readable`,
    value: token,
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

/**
 * CSRF Protection Middleware
 * Add to API routes that modify data
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate CSRF token
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

/**
 * GET endpoint to retrieve CSRF token
 * Call this on app load: fetch('/api/csrf')
 */
export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ token });

  setCsrfCookie(response, token);

  return response;
}
