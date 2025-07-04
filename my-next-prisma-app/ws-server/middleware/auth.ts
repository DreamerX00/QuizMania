import { Socket } from 'socket.io';
// If Clerk types are missing, run: npm install --save-dev @types/clerk__clerk-sdk-node
// If ExtendedError is missing, define it locally:
// If socket.io types are missing, run: npm install --save-dev @types/socket.io
// (This file assumes types are present.)
type ExtendedError = Error & { data?: unknown };
import { verifyToken } from '@clerk/clerk-sdk-node';
import { logger } from '../config/logger';

interface ClerkSession {
  sub: string;
  email?: string;
  firstName?: string;
  username?: string;
  publicMetadata?: { premium?: boolean };
  [key: string]: unknown;
}

interface ClerkUser {
  id: string;
  email?: string;
  name: string;
  premium: boolean;
  clerkSession: ClerkSession;
}

export async function authMiddleware(socket: Socket & { user?: ClerkUser }, next: (err?: ExtendedError) => void) {
  const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    // Clerk: verify the token and attach user info
    const session = (await verifyToken(token)) as ClerkSession;
    socket.user = {
      id: session.sub,
      email: session.email,
      name: session.firstName || session.username || 'User',
      premium: !!(session.publicMetadata && session.publicMetadata.premium),
      clerkSession: session
    };
    next();
  } catch (err) {
    logger.error('Clerk token verification failed', err);
    next(new Error('Invalid or expired Clerk token'));
  }
} 