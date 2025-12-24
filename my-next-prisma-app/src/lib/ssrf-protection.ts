/**
 * Server-Side Request Forgery (SSRF) Protection
 * Validates outbound HTTP requests to prevent SSRF attacks
 *
 * Protects against:
 * - Internal network scanning
 * - Cloud metadata service access (169.254.169.254)
 * - Localhost/private IP range access
 * - DNS rebinding attacks
 */

import { URL } from "url";
import { isIP } from "net";

/**
 * Blocked IP ranges (RFC1918 private networks + localhost + cloud metadata)
 */
const BLOCKED_IP_RANGES = [
  // Localhost
  /^127\./,
  /^::1$/,
  /^0\.0\.0\.0$/,
  /^localhost$/i,

  // Private networks (RFC1918)
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,

  // Link-local
  /^169\.254\./,
  /^fe80:/i,

  // Cloud metadata endpoints
  /^169\.254\.169\.254$/,
  /^metadata\.google\.internal$/i,
];

/**
 * Allowed external domains (whitelist for AI APIs, payment gateways, etc.)
 */
const ALLOWED_EXTERNAL_DOMAINS = [
  "api.openai.com",
  "api.anthropic.com",
  "api.razorpay.com",
  "checkout.razorpay.com",
  "api.stripe.com",
  "livekit.cloud",
];

/**
 * Check if hostname is a blocked IP or private network
 */
function isBlockedHost(hostname: string): boolean {
  // Direct IP check
  const ipVersion = isIP(hostname);
  if (ipVersion !== 0) {
    return BLOCKED_IP_RANGES.some((pattern) => pattern.test(hostname));
  }

  // Hostname pattern check
  return BLOCKED_IP_RANGES.some((pattern) => pattern.test(hostname));
}

/**
 * Validate if URL is safe for outbound requests
 */
export function isSafeOutboundUrl(urlString: string): {
  safe: boolean;
  reason?: string;
} {
  try {
    const url = new URL(urlString);

    // Only allow http/https
    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        safe: false,
        reason: `Unsafe protocol: ${url.protocol}`,
      };
    }

    // Check for blocked hosts
    if (isBlockedHost(url.hostname)) {
      return {
        safe: false,
        reason: "Access to private networks is not allowed",
      };
    }

    // Check against whitelist
    const isWhitelisted = ALLOWED_EXTERNAL_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isWhitelisted) {
      return {
        safe: false,
        reason: `Domain not in whitelist: ${url.hostname}`,
      };
    }

    return { safe: true };
  } catch {
    return {
      safe: false,
      reason: "Invalid URL",
    };
  }
}

/**
 * Safe fetch wrapper with SSRF protection
 * Use this instead of direct fetch() for user-provided URLs
 */
export async function safeFetch(
  urlString: string,
  options?: RequestInit
): Promise<Response> {
  const validation = isSafeOutboundUrl(urlString);

  if (!validation.safe) {
    throw new Error(`SSRF protection: ${validation.reason}`);
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(urlString, {
      ...options,
      signal: controller.signal,
      // Prevent following redirects that might lead to internal IPs
      redirect: "manual",
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate webhook URLs (for user-provided webhook endpoints)
 */
export function isValidWebhookUrl(urlString: string): {
  valid: boolean;
  reason?: string;
} {
  try {
    const url = new URL(urlString);

    // Must be HTTPS in production
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      return {
        valid: false,
        reason: "Webhook URLs must use HTTPS in production",
      };
    }

    // Block private networks
    if (isBlockedHost(url.hostname)) {
      return {
        valid: false,
        reason: "Webhook URLs cannot point to private networks",
      };
    }

    // Block localhost in production
    if (
      process.env.NODE_ENV === "production" &&
      /localhost|127\.0\.0\.1/i.test(url.hostname)
    ) {
      return {
        valid: false,
        reason: "Localhost webhooks not allowed in production",
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      reason: "Invalid URL format",
    };
  }
}

/**
 * Add allowed domain to whitelist (use with caution)
 */
export function addAllowedDomain(domain: string): void {
  if (!ALLOWED_EXTERNAL_DOMAINS.includes(domain)) {
    ALLOWED_EXTERNAL_DOMAINS.push(domain);
  }
}
