import { Socket } from 'socket.io';
// If Clerk types are missing, run: npm install --save-dev @types/clerk__clerk-sdk-node
// If ExtendedError is missing, define it locally:
// If socket.io types are missing, run: npm install --save-dev @types/socket.io
// (This file assumes types are present.)
type ExtendedError = Error & { data?: unknown };
// Use Clerk's backend verification API
import { verifyToken } from '@clerk/backend';
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
  
  // Debug logging
  logger.info('Auth middleware called', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 10)}...` : 'no token',
    authData: socket.handshake.auth,
    headers: Object.keys(socket.handshake.headers),
    envClerkSecretPreview: process.env.CLERK_SECRET_KEY ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` : 'not set',
    envClerkSecretSet: !!process.env.CLERK_SECRET_KEY
  });
  logger.info('Token received in handshake', { token });
  logger.info('Clerk secret in env', { key: process.env.CLERK_SECRET_KEY ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` : 'not set' });
  
  if (!token) {
    logger.warn('No token provided in auth middleware');
    return next(new Error('Authentication required'));
  }
  
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    logger.info('Verifying token with Clerk', { cleanTokenPreview: cleanToken ? `${cleanToken.substring(0, 10)}...` : 'no token' });
    
    const issuer = process.env.CLERK_JWT_ISSUER || process.env.CLERK_ISSUER;
    const authorizedParties = process.env.CLERK_AUTHORIZED_PARTIES
      ? process.env.CLERK_AUTHORIZED_PARTIES.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    if (!issuer) {
      logger.error('Clerk JWT issuer is not configured. Please set CLERK_JWT_ISSUER.');
      return next(new Error('Server misconfiguration: CLERK_JWT_ISSUER not set'));
    }

    // Clerk: verify the session token and attach user info
    const session = await verifyToken(cleanToken, {
      secretKey: process.env.CLERK_SECRET_KEY,
      issuer,
      authorizedParties,
    } as any) as ClerkSession;
    
    socket.user = {
      id: session.sub,
      email: session.email,
      name: session.firstName || session.username || 'User',
      premium: !!(session.publicMetadata && session.publicMetadata.premium),
      clerkSession: session
    };
    logger.info('User authenticated successfully', { userId: socket.user.id });
    next();
  } catch (err) {
    logger.error('Clerk token verification failed', { 
      error: err instanceof Error ? err.message : 'Unknown error',
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'no token',
      envClerkSecretPreview: process.env.CLERK_SECRET_KEY ? `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` : 'not set',
      errStack: err instanceof Error ? err.stack : err
    });
    next(new Error('Invalid or expired Clerk token'));
  }
} 