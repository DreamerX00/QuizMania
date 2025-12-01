/**
 * Open Redirect Protection
 * Validates redirect URLs to prevent open redirect vulnerabilities
 *
 * Protects against:
 * - Phishing attacks via redirect parameter manipulation
 * - External site redirects
 * - Protocol abuse (javascript:, data:, etc.)
 */

/**
 * Allowed redirect paths (whitelist)
 */
const ALLOWED_REDIRECT_PATHS = [
  "/dashboard",
  "/profile",
  "/quizzes",
  "/leaderboard",
  "/settings",
  "/play",
  "/create",
  "/packages",
];

/**
 * Validate if redirect URL is safe
 * Only allows same-origin redirects to whitelisted paths
 */
export function isSafeRedirect(
  redirectUrl: string | null | undefined
): boolean {
  if (!redirectUrl) return false;

  try {
    // Decode URL to prevent encoding bypasses
    const decoded = decodeURIComponent(redirectUrl);

    // Block data: and javascript: protocols
    if (/^(data|javascript|vbscript|file):/i.test(decoded)) {
      return false;
    }

    // Block protocol-relative URLs (//evil.com)
    if (decoded.startsWith("//")) {
      return false;
    }

    // If URL contains protocol, validate it's http/https
    if (decoded.includes(":")) {
      const url = new URL(decoded, "http://localhost");
      if (!["http:", "https:"].includes(url.protocol)) {
        return false;
      }

      // Block external domains
      if (
        url.hostname !== "localhost" &&
        url.hostname !== window?.location?.hostname
      ) {
        return false;
      }
    }

    // Must be relative path starting with /
    if (!decoded.startsWith("/")) {
      return false;
    }

    // Prevent path traversal
    if (decoded.includes("..")) {
      return false;
    }

    // Check against whitelist
    const pathname = decoded.split("?")[0]?.split("#")[0];
    if (!pathname) return false;

    return ALLOWED_REDIRECT_PATHS.some((allowed) =>
      pathname.startsWith(allowed)
    );
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Get safe redirect URL or fallback
 * Use this to sanitize user-provided redirect parameters
 *
 * @param redirectUrl - User-provided redirect URL
 * @param fallback - Fallback URL if redirect is unsafe (default: /dashboard)
 */
export function getSafeRedirectUrl(
  redirectUrl: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (isSafeRedirect(redirectUrl)) {
    return redirectUrl as string;
  }
  return fallback;
}

/**
 * Middleware wrapper for redirect validation
 * Use in API routes that accept redirect parameters
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const { redirect } = await request.json();
 *   const safeRedirect = getSafeRedirectUrl(redirect);
 *
 *   // ... perform login
 *
 *   return NextResponse.json({ redirectTo: safeRedirect });
 * }
 * ```
 */
export function validateRedirectParam(
  searchParams: URLSearchParams,
  paramName = "redirect"
): string {
  const redirect = searchParams.get(paramName);
  return getSafeRedirectUrl(redirect);
}

/**
 * Server-side redirect validation (for Next.js redirects)
 */
export function createSafeRedirect(
  destination: string,
  fallback = "/dashboard"
): { redirect: { destination: string; permanent: boolean } } {
  const safeDestination = getSafeRedirectUrl(destination, fallback);

  return {
    redirect: {
      destination: safeDestination,
      permanent: false,
    },
  };
}
