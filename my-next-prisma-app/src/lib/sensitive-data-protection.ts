/**
 * Sensitive Data Protection
 * Sanitizes logs, errors, and responses to prevent data leakage
 *
 * Protects against:
 * - Credential leakage in logs
 * - PII exposure in error messages
 * - API key exposure
 * - Database query leaks
 */

/**
 * Patterns to redact (credit cards, tokens, emails, etc.)
 */
const SENSITIVE_PATTERNS = [
  // API Keys and Tokens
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, replacement: "[REDACTED_API_KEY]" },
  { pattern: /sk_test_[a-zA-Z0-9]{24,}/g, replacement: "[REDACTED_API_KEY]" },
  {
    pattern: /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
    replacement: "Bearer [REDACTED]",
  },

  // Credit card numbers (basic pattern)
  {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: "[REDACTED_CC]",
  },

  // Email addresses
  {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[REDACTED_EMAIL]",
  },

  // Phone numbers (US format)
  {
    pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    replacement: "[REDACTED_PHONE]",
  },

  // AWS keys
  { pattern: /AKIA[0-9A-Z]{16}/g, replacement: "[REDACTED_AWS_KEY]" },

  // JWT tokens
  {
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    replacement: "[REDACTED_JWT]",
  },

  // Database URLs
  { pattern: /postgres:\/\/[^\s]+/g, replacement: "postgres://[REDACTED]" },
  { pattern: /mysql:\/\/[^\s]+/g, replacement: "mysql://[REDACTED]" },
  {
    pattern: /mongodb(\+srv)?:\/\/[^\s]+/g,
    replacement: "mongodb://[REDACTED]",
  },

  // Passwords in URLs or JSON
  {
    pattern: /password["\s:=]+[^\s"',}]+/gi,
    replacement: "password=[REDACTED]",
  },
  { pattern: /pwd["\s:=]+[^\s"',}]+/gi, replacement: "pwd=[REDACTED]" },
];

/**
 * Environment variables to never log
 */
const SENSITIVE_ENV_VARS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "RAZORPAY_KEY_SECRET",
  "JWT_SECRET",
  "SESSION_SECRET",
  "REDIS_PASSWORD",
  "LIVEKIT_API_SECRET",
];

/**
 * Redact sensitive data from string
 */
export function redactSensitiveData(input: string): string {
  let sanitized = input;

  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

/**
 * Redact sensitive data from objects (logs, errors)
 */
export function redactObject<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (typeof obj === "string") {
    return redactSensitiveData(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item)) as T;
  }

  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Redact sensitive keys
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("token") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("apikey") ||
      lowerKey.includes("api_key")
    ) {
      redacted[key] = "[REDACTED]";
      continue;
    }

    // Recursively redact nested objects
    if (typeof value === "object" && value !== null) {
      redacted[key] = redactObject(value);
    } else if (typeof value === "string") {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted as T;
}

/**
 * Safe error serialization for client responses
 * Removes stack traces and sensitive data in production
 */
export function sanitizeError(error: unknown): {
  message: string;
  code?: string;
  statusCode?: number;
} {
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof Error) {
    // In production, use generic messages for security errors
    if (isProduction && error.message.includes("ENOTFOUND")) {
      return {
        message: "Service temporarily unavailable",
        statusCode: 503,
      };
    }

    return {
      message: redactSensitiveData(error.message),
      code: (error as { code?: string }).code,
      statusCode: (error as { statusCode?: number }).statusCode || 500,
    };
  }

  return {
    message: isProduction ? "An unexpected error occurred" : String(error),
    statusCode: 500,
  };
}

/**
 * Safe logging function (replaces console.log in production)
 */
export function safeLog(
  level: "info" | "warn" | "error",
  message: string,
  data?: unknown
): void {
  const timestamp = new Date().toISOString();
  const sanitizedMessage = redactSensitiveData(message);
  const sanitizedData = data ? redactObject(data) : undefined;

  const logEntry = {
    timestamp,
    level,
    message: sanitizedMessage,
    ...(sanitizedData && { data: sanitizedData }),
  };

  // In production, send to logging service (e.g., Sentry, Datadog)
  if (process.env.NODE_ENV === "production") {
    // Example: sendToLoggingService(logEntry);
    console[level](JSON.stringify(logEntry));
  } else {
    console[level](sanitizedMessage, sanitizedData || "");
  }
}

/**
 * Redact environment variables from process.env
 * Use this when logging environment for debugging
 */
export function redactEnvVars(): Record<string, string> {
  const redacted: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (SENSITIVE_ENV_VARS.some((sensitive) => key.includes(sensitive))) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = value || "";
    }
  }

  return redacted;
}

/**
 * Mask PII in user data (for logging/analytics)
 */
export function maskPII(data: {
  email?: string;
  phone?: string;
  name?: string;
}): typeof data {
  return {
    ...data,
    email: data.email ? maskEmail(data.email) : undefined,
    phone: data.phone ? maskPhone(data.phone) : undefined,
    name: data.name ? maskName(data.name) : undefined,
  };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || !local) return "[INVALID_EMAIL]";

  const maskedLocal =
    local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : "***";

  return `${maskedLocal}@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";

  return `***-***-${digits.slice(-4)}`;
}

function maskName(name: string): string {
  const parts = name.split(" ");
  return parts.map((part) => `${part[0]}***`).join(" ");
}

/**
 * Safe JSON stringify (handles circular references and redacts sensitive data)
 */
export function safeStringify(obj: unknown, indent?: number): string {
  const seen = new WeakSet();

  return JSON.stringify(
    obj,
    (key, value) => {
      // Handle circular references
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }

      // Redact sensitive keys
      if (typeof key === "string") {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes("password") ||
          lowerKey.includes("token") ||
          lowerKey.includes("secret")
        ) {
          return "[REDACTED]";
        }
      }

      return value;
    },
    indent
  );
}
