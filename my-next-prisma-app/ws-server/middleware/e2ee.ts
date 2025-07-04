import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

export function e2eeMiddleware(socket: Socket, next: (err?: ExtendedError) => void) {
  // Placeholder: In production, decrypt incoming payloads and encrypt outgoing if E2EE is enabled for this room
  // For now, just pass through
  next();
} 