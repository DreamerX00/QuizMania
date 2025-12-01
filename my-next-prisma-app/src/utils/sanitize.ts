/**
 * XSS Protection Utilities
 * Sanitizes user input to prevent Cross-Site Scripting attacks
 */

import sanitizeHtml from "sanitize-html";
import validator from "validator";

/**
 * Strict sanitization - strips ALL HTML tags
 * Use for: usernames, emails, search queries, form inputs
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML allowed
    allowedAttributes: {},
  }).trim();
}

/**
 * Moderate sanitization - allows safe formatting tags
 * Use for: quiz descriptions, user bios, comments
 */
export function sanitizeRichText(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {},
    allowedIframeHostnames: [], // No iframes
  });
}

/**
 * URL validation and sanitization
 * Prevents javascript:, data:, and other dangerous protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  // Validate URL format
  if (
    !validator.isURL(url, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    return "";
  }

  // Additional check for dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  const lowerUrl = url.toLowerCase();

  if (dangerousProtocols.some((proto) => lowerUrl.startsWith(proto))) {
    return "";
  }

  return url; // Already validated
}

/**
 * Email sanitization
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  const sanitized = validator.normalizeEmail(email) || "";
  return validator.isEmail(sanitized) ? sanitized : "";
}

/**
 * SQL-safe string (backup for ORM edge cases)
 */
export function escapeSql(input: string): string {
  if (!input) return "";
  return input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case '"':
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  });
}

/**
 * Sanitize object recursively
 * Use for: API request bodies, form data
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key as keyof T] = sanitizeObject(
        value as Record<string, unknown>
      ) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === "string"
          ? sanitizeText(item)
          : typeof item === "object"
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Strip ANSI codes from logs (prevents terminal injection)
 */
export function sanitizeLog(message: string): string {
  if (!message) return "";
  // Remove ANSI escape codes
  return message.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Filename sanitization (prevents path traversal)
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return "";

  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, "");

  // Remove special characters and path separators
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Limit length
  safe = safe.substring(0, 255);

  return safe;
}
