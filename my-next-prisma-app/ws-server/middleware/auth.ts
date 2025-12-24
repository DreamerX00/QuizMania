import { Socket } from "socket.io";
import * as jose from "jose";
import { logger } from "../config/logger";

type ExtendedError = Error & { data?: unknown };

interface JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  id?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

interface AuthenticatedUser {
  id: string;
  email?: string;
  name: string;
  image?: string;
}

/**
 * Socket.IO Authentication Middleware
 *
 * Verifies NextAuth JWT tokens for WebSocket connections.
 * Uses NEXTAUTH_SECRET for JWT verification.
 */
export async function authMiddleware(
  socket: Socket & { user?: AuthenticatedUser },
  next: (err?: ExtendedError) => void
) {
  const token =
    socket.handshake.auth?.token || socket.handshake.headers["authorization"];

  logger.info("Auth middleware called", {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "no token",
    authData: socket.handshake.auth,
    headers: Object.keys(socket.handshake.headers),
  });

  if (!token) {
    logger.warn("No token provided in auth middleware");
    return next(new Error("Authentication required"));
  }

  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    // Get the NextAuth secret
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      logger.error("NEXTAUTH_SECRET is not configured");
      return next(
        new Error("Server misconfiguration: NEXTAUTH_SECRET not set")
      );
    }

    // Verify the JWT
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(cleanToken, secretKey, {
      algorithms: ["HS256"],
    });

    const jwtPayload = payload as JWTPayload;

    // Extract user info from JWT
    const userId = jwtPayload.id || jwtPayload.sub;
    if (!userId) {
      logger.error("JWT payload missing user ID");
      return next(new Error("Invalid token: missing user ID"));
    }

    socket.user = {
      id: userId,
      email: jwtPayload.email,
      name: jwtPayload.name || "User",
      image: jwtPayload.picture,
    };

    logger.info("User authenticated successfully", {
      userId: socket.user.id,
      name: socket.user.name,
    });
    next();
  } catch (err) {
    logger.error("JWT verification failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      tokenPreview: token ? `${token.substring(0, 20)}...` : "no token",
      errStack: err instanceof Error ? err.stack : err,
    });
    next(new Error("Invalid or expired token"));
  }
}
