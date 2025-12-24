import { Socket } from "socket.io";
import * as crypto from "crypto";
import { logger } from "../config/logger";

// E2EE Configuration
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

// Room-specific encryption keys (generated per room session)
const roomKeys = new Map<string, Buffer>();

interface EncryptedPayload {
  encrypted: true;
  iv: string;
  authTag: string;
  data: string;
}

interface DecryptedSocket extends Socket {
  e2eeEnabled?: boolean;
  roomKey?: Buffer;
  user?: { id: string; name?: string; email?: string };
}

/**
 * Generate a new encryption key for a room
 */
export function generateRoomKey(roomId: string): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  roomKeys.set(roomId, key);
  // Return base64 encoded key for sharing with clients
  return key.toString("base64");
}

/**
 * Get the encryption key for a room
 */
export function getRoomKey(roomId: string): Buffer | undefined {
  return roomKeys.get(roomId);
}

/**
 * Remove room key when room is destroyed
 */
export function removeRoomKey(roomId: string): void {
  roomKeys.delete(roomId);
}

/**
 * Encrypt a message using AES-256-GCM
 */
export function encrypt(plaintext: string, key: Buffer): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return {
    encrypted: true,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    data: encrypted,
  };
}

/**
 * Decrypt a message using AES-256-GCM
 */
export function decrypt(payload: EncryptedPayload, key: Buffer): string {
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const encryptedData = Buffer.from(payload.data, "base64");

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Check if a payload is encrypted
 */
function isEncryptedPayload(data: unknown): data is EncryptedPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    "encrypted" in data &&
    (data as EncryptedPayload).encrypted === true &&
    "iv" in data &&
    "authTag" in data &&
    "data" in data
  );
}

/**
 * E2EE Middleware for Socket.IO
 *
 * This middleware handles encryption/decryption of messages for rooms
 * that have E2EE enabled. It:
 * 1. Intercepts incoming messages and decrypts if needed
 * 2. Wraps outgoing emits to encrypt if E2EE is enabled
 */
export function e2eeMiddleware(
  socket: DecryptedSocket,
  next: (err?: Error) => void
) {
  // Store original emit for interception
  const originalEmit = socket.emit.bind(socket);

  // Track E2EE state
  socket.e2eeEnabled = false;

  // Handle room key exchange
  socket.on(
    "e2ee:request-key",
    async (roomId: string, callback: (key: string | null) => void) => {
      try {
        let key = roomKeys.get(roomId);
        if (!key) {
          // Generate new key for room
          const keyBase64 = generateRoomKey(roomId);
          callback(keyBase64);
          logger.info("Generated new E2EE key for room", {
            roomId,
            userId: socket.user?.id,
          });
        } else {
          callback(key.toString("base64"));
          logger.info("Provided existing E2EE key for room", {
            roomId,
            userId: socket.user?.id,
          });
        }
      } catch (error) {
        logger.error("Error in e2ee:request-key", { error, roomId });
        callback(null);
      }
    }
  );

  // Enable E2EE for this socket
  socket.on("e2ee:enable", (roomId: string) => {
    const key = roomKeys.get(roomId);
    if (key) {
      socket.e2eeEnabled = true;
      socket.roomKey = key;
      logger.info("E2EE enabled for socket", { socketId: socket.id, roomId });
    }
  });

  // Disable E2EE for this socket
  socket.on("e2ee:disable", () => {
    socket.e2eeEnabled = false;
    socket.roomKey = undefined;
    logger.info("E2EE disabled for socket", { socketId: socket.id });
  });

  // Intercept chat messages to decrypt if needed
  socket.use(([event, ...args], next) => {
    // Only process chat-related events
    if (!["chat:message", "chat:private"].includes(event)) {
      return next();
    }

    const data = args[0];

    // Check if incoming message is encrypted
    if (isEncryptedPayload(data) && socket.roomKey) {
      try {
        const decrypted = decrypt(data, socket.roomKey);
        args[0] = JSON.parse(decrypted);
        logger.debug("Decrypted incoming message", {
          event,
          socketId: socket.id,
        });
      } catch (error) {
        logger.error("Failed to decrypt message", {
          error,
          socketId: socket.id,
        });
        return next(new Error("Failed to decrypt message"));
      }
    }

    next();
  });

  // Override emit to encrypt outgoing messages when E2EE is enabled
  socket.emit = function (event: string, ...args: unknown[]): boolean {
    // Only encrypt specific events
    const encryptEvents = ["chat:message", "chat:broadcast", "chat:private"];

    if (socket.e2eeEnabled && socket.roomKey && encryptEvents.includes(event)) {
      try {
        const data = args[0];
        if (typeof data === "object" && !isEncryptedPayload(data)) {
          const encrypted = encrypt(JSON.stringify(data), socket.roomKey);
          args[0] = encrypted;
          logger.debug("Encrypted outgoing message", {
            event,
            socketId: socket.id,
          });
        }
      } catch (error) {
        logger.error("Failed to encrypt message", {
          error,
          socketId: socket.id,
        });
      }
    }

    return originalEmit(event, ...args);
  } as typeof socket.emit;

  next();
}

/**
 * Clean up room keys on server shutdown
 */
export function cleanupE2EE(): void {
  roomKeys.clear();
  logger.info("E2EE room keys cleared");
}
