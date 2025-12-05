"use client";

import { useSocket } from "@/lib/socket";

export default function WebSocketStatus() {
  const { isConnected, connectionInfo } = useSocket();

  // Don't show anything when connected
  if (isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-yellow-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
      <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
      {connectionInfo.isWakingUp ? (
        <span>🔄 Server waking up (Render free tier), please wait...</span>
      ) : (
        <span>
          🔄 Reconnecting...
          {connectionInfo.reconnectAttempts > 1 &&
            ` (attempt ${connectionInfo.reconnectAttempts})`}
        </span>
      )}
    </div>
  );
}
