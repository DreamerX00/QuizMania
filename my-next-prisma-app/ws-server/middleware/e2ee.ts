import { Socket } from "socket.io";

export function e2eeMiddleware(socket: Socket, next: (err?: Error) => void) {
  // Placeholder: In production, decrypt incoming payloads and encrypt outgoing if E2EE is enabled for this room
  // For now, just pass through
  next();
}
