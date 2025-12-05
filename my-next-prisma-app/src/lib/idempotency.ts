/**
 * Idempotency Key Management Utility
 *
 * This utility helps prevent duplicate API requests by generating and managing
 * unique idempotency keys. Use this on the client-side to ensure operations
 * like quiz creation, publishing, and payments are only executed once.
 *
 * @example
 * ```typescript
 * import { generateIdempotencyKey, getStoredKey, clearStoredKey } from '@/lib/idempotency';
 *
 * // Generate or retrieve existing key for an operation
 * const key = generateIdempotencyKey('publish-quiz', quizId);
 *
 * // Use in API call
 * const response = await fetch('/api/quizzes/templates/123/publish', {
 *   method: 'PATCH',
 *   body: JSON.stringify({ idempotencyKey: key })
 * });
 *
 * // Clear after successful completion
 * if (response.ok) {
 *   clearStoredKey('publish-quiz', quizId);
 * }
 * ```
 */

/**
 * Generates a UUID v4 string
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a storage key for the idempotency key
 */
function getStorageKey(operation: string, identifier?: string): string {
  return `idempotency:${operation}${identifier ? `:${identifier}` : ""}`;
}

/**
 * Generates or retrieves an existing idempotency key for an operation
 *
 * @param operation - The operation name (e.g., 'publish-quiz', 'create-quiz', 'subscribe')
 * @param identifier - Optional identifier for the operation (e.g., quizId, userId)
 * @param ttlMinutes - How long to store the key in minutes (default: 5 minutes)
 * @returns UUID v4 idempotency key
 */
export function generateIdempotencyKey(
  operation: string,
  identifier?: string,
  ttlMinutes: number = 5
): string {
  if (typeof window === "undefined") {
    // Server-side: just generate new UUID
    return generateUUID();
  }

  const storageKey = getStorageKey(operation, identifier);

  try {
    // Check if we have a stored key
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const { key, expiresAt } = JSON.parse(stored);

      // Return existing key if not expired
      if (Date.now() < expiresAt) {
        return key;
      }

      // Clear expired key
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.error("Error reading stored idempotency key:", error);
  }

  // Generate new key
  const newKey = generateUUID();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ key: newKey, expiresAt })
    );
  } catch (error) {
    console.error("Error storing idempotency key:", error);
  }

  return newKey;
}

/**
 * Retrieves a stored idempotency key without generating a new one
 *
 * @param operation - The operation name
 * @param identifier - Optional identifier
 * @returns The stored key or null if not found/expired
 */
export function getStoredKey(
  operation: string,
  identifier?: string
): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKey = getStorageKey(operation, identifier);

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const { key, expiresAt } = JSON.parse(stored);

      if (Date.now() < expiresAt) {
        return key;
      }

      // Clear expired key
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.error("Error reading stored idempotency key:", error);
  }

  return null;
}

/**
 * Clears a stored idempotency key after successful operation
 *
 * @param operation - The operation name
 * @param identifier - Optional identifier
 */
export function clearStoredKey(operation: string, identifier?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = getStorageKey(operation, identifier);

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Error clearing stored idempotency key:", error);
  }
}

/**
 * Clears all expired idempotency keys from storage
 * Call this on app initialization or periodically
 */
export function cleanupExpiredKeys(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("idempotency:")) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const { expiresAt } = JSON.parse(stored);
            if (Date.now() >= expiresAt) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid format, remove it
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} expired idempotency keys`);
    }
  } catch (error) {
    console.error("Error cleaning up expired idempotency keys:", error);
  }
}

/**
 * React hook for managing idempotency keys
 *
 * @example
 * ```typescript
 * function PublishButton({ quizId }) {
 *   const { key, regenerate, clear } = useIdempotencyKey('publish-quiz', quizId);
 *
 *   const handlePublish = async () => {
 *     const response = await fetch('/api/publish', {
 *       method: 'POST',
 *       body: JSON.stringify({ idempotencyKey: key })
 *     });
 *
 *     if (response.ok) {
 *       clear();
 *     }
 *   };
 *
 *   return <button onClick={handlePublish}>Publish</button>;
 * }
 * ```
 */
export function useIdempotencyKey(
  operation: string,
  identifier?: string,
  ttlMinutes: number = 5
) {
  const key = generateIdempotencyKey(operation, identifier, ttlMinutes);

  return {
    key,
    regenerate: () => {
      clearStoredKey(operation, identifier);
      return generateIdempotencyKey(operation, identifier, ttlMinutes);
    },
    clear: () => clearStoredKey(operation, identifier),
  };
}
