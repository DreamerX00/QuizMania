import React, { useState } from "react";
import { motion } from "framer-motion";
import RoomAvatarGrid from "./RoomAvatarGrid";
import RoomInfoPanel from "./RoomInfoPanel";
import RoomHostControls from "./RoomHostControls";
import InviteModal from "@/app/multiplayer-arena/components/InviteModal";
import { MessageCircle } from "lucide-react";
import useSWR from "swr";

function _ParticleBurst({
  x,
  y,
  keyId,
}: {
  x: number;
  y: number;
  keyId: string;
}) {
  // Simple burst of 8 particles
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 2 }}
      transition={{ duration: 0.8 }}
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ["#60a5fa", "#a78bfa", "#f472b6", "#22c55e"][i % 4],
            left: 0,
            top: 0,
            transform: `rotate(${i * 45}deg) translate(0, -24px)`,
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.5 }}
          transition={{ duration: 0.8 }}
        />
      ))}
    </motion.div>
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// List of fallback avatars
const fallbackAvatars = [
  "/avatars/wink%20(2).png",
  "/avatars/voila.png",
  "/avatars/sleep.png",
  "/avatars/maybe.png",
  "/avatars/bored%20.png",
  "/avatars/tears.png",
  "/avatars/pissed.png",
  "/avatars/hmmm.png",
  "/avatars/shocked.png",
  "/avatars/gotit.png",
  "/avatars/amazed.png",
  "/avatars/hi.png",
  "/avatars/wink.png",
  "/avatars/kiss.png",
  "/avatars/sleeping.png",
  "/avatars/thinking.png",
  "/avatars/sad.png",
  "/avatars/crying.png",
  "/avatars/angry.png",
];

function getRandomAvatar(seed: string) {
  // Use a hash of the seed (user id or name) for deterministic fallback
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  hash = Math.abs(hash);
  return fallbackAvatars[hash % fallbackAvatars.length];
}

export default function RoomLobby({
  room,
  members,
  currentUser,
}: {
  room: { id: string; [key: string]: unknown };
  members: Array<{ role?: string; userId: string; [key: string]: unknown }>;
  currentUser: { userId: string; [key: string]: unknown };
}) {
  const isHost = members.find(
    (m) => m.role === "HOST" && m.userId === currentUser.userId
  );
  const [chatInput, setChatInput] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const {
    data: chatData,
    error: chatError,
    isLoading: chatLoading,
    mutate: mutateChat,
  } = useSWR(room ? `/api/rooms/chat?roomId=${room.id}` : null, fetcher);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [unreadCount, _setUnreadCount] = useState(0);

  // Chat send handler
  const handleSend = async () => {
    if (!chatInput.trim()) return;
    await fetch("/api/rooms/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: room.id, message: chatInput }),
    });
    setChatInput("");
    mutateChat();
  };

  // Invite handler - opens invite modal
  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  // Start match handler - initiates game start via WebSocket/API
  const handleStartMatch = async () => {
    try {
      const response = await fetch(`/api/rooms/${room.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start match");
      }

      await response.json();

      // ✅ Emit WebSocket event to notify all room members in real-time
      const { socketService } = await import("@/lib/socket");
      if (socketService.isConnected()) {
        socketService.startGame(
          room.id as string,
          String(room.gameMode || "standard")
        );
      }

      // Success handled by WebSocket event listeners
    } catch (error) {
      console.error("Failed to start match:", error);
      // Toast notification handled by RoomHostControls
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-screen relative bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left: Player Grid */}
      <section className="flex-1 flex flex-col items-center justify-center bg-linear-to-br from-slate-900/50 via-blue-950/30 to-purple-950/30 backdrop-blur-sm p-4 md:p-8 relative">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-400 flex items-center gap-2 mb-6 tracking-widest uppercase drop-shadow-glow">
            Lobby
          </h2>
          <RoomAvatarGrid
            players={members.map((m) => {
              const user =
                typeof m.user === "object" && m.user !== null
                  ? (m.user as Record<string, unknown>)
                  : {};
              return {
                ...user,
                id: String(user.id || ""),
                name: String(user.name || "Unknown"),
                role: String(m.role || ""),
                avatar: String(
                  user.avatarUrl ||
                    getRandomAvatar(
                      String(user.id || user.name || Math.random().toString())
                    )
                ),
              };
            })}
            hostId={String(
              (
                members.find((m) => m.role === "HOST")?.user as
                  | Record<string, unknown>
                  | undefined
              )?.id || ""
            )}
            teamMode={room.type === "Squad" || room.type === "Custom"}
            user={currentUser}
          />
        </div>
      </section>
      {/* Right: Info/Controls/Chat */}
      <aside className="flex flex-col gap-6 max-w-[420px] w-full min-w-[320px] bg-linear-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md p-4 md:p-6 border-l border-blue-500/30 shadow-2xl shadow-blue-500/10 relative overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-linear-to-b from-slate-900/98 via-slate-900/95 to-transparent backdrop-blur-md rounded-xl pb-3 mb-4 flex flex-col gap-3 border-b border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(147,51,234,0.5)] tracking-wide">
              {String(room.title || room.name || "Room")}
            </span>
            <span className="ml-auto flex items-center gap-2 bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-mono text-lg font-semibold">
              {members.length}/{String(room.maxPlayers || 0)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-blue-300">Host:</span>{" "}
              {String(
                (
                  members.find((m) => m.role === "HOST")?.user as
                    | Record<string, unknown>
                    | undefined
                )?.name || ""
              )}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-blue-300">Type:</span>{" "}
              {String(room.type || "")}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-blue-300">Quiz:</span>{" "}
              {Array.isArray(room.quizTypes) && room.quizTypes.length > 0
                ? room.quizTypes.join(", ")
                : "—"}
            </span>
          </div>
        </div>
        <RoomInfoPanel room={room} isHost={!!isHost} />
        {isHost && (
          <RoomHostControls
            room={{
              ...room,
              id: String(room.id || ""),
              name: String(room.name || ""),
              code: String(room.code || ""),
              type: String(room.type || ""),
              maxParticipants: Number(room.maxParticipants || 0),
              quizTypes: Array.isArray(room.quizTypes)
                ? room.quizTypes.map(String)
                : [],
            }}
            onInvite={handleInvite}
            onStartMatch={handleStartMatch}
          />
        )}
        {/* Chat Box (desktop) */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 shadow-xl shadow-blue-500/5 text-slate-300 min-h-[120px] mt-2">
          <div className="flex-1 overflow-y-auto space-y-2">
            {chatLoading ? (
              <div className="text-slate-400">Loading chat...</div>
            ) : chatError ? (
              <div className="text-red-500">Error loading chat.</div>
            ) : chatData?.messages?.length === 0 ? (
              <div className="text-slate-400">No messages yet.</div>
            ) : (
              (
                chatData?.messages as
                  | Array<{ id: string; [key: string]: unknown }>
                  | undefined
              )?.map((msg, _i: number) => (
                <div
                  key={msg.id}
                  className="bg-slate-800/90 backdrop-blur-sm rounded-xl px-4 py-2.5 text-white w-fit flex items-center gap-2 border border-slate-700/30 shadow-md shadow-blue-500/5 animate-fade-in"
                >
                  <span className="font-bold text-blue-400">
                    {String(
                      (msg.user as Record<string, unknown> | undefined)?.name ||
                        ""
                    )}
                  </span>{" "}
                  {String(msg.message || "")}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 bg-slate-800/90 backdrop-blur-sm rounded-xl px-4 py-2.5 text-white border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
        {/* Footer (host only, sticky) */}
        {isHost && (
          <div className="sticky bottom-0 left-0 w-full bg-linear-to-t from-slate-900/98 via-slate-900/90 to-transparent backdrop-blur-md p-4 flex items-center justify-end rounded-b-2xl border-t border-blue-500/30 mt-4">
            <button
              className={`px-8 py-3.5 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center gap-2 ${
                members.length >= 2
                  ? "bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 animate-pulse"
                  : "bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/30"
              }`}
              disabled={members.length < 2}
              title={
                members.length < 2
                  ? "At least 2 players required to start"
                  : "Start Match"
              }
            >
              Start Match
            </button>
          </div>
        )}
      </aside>
      {/* Floating Chat Drawer for Mobile */}
      <>
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-full p-4 shadow-2xl shadow-blue-500/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={() => setMobileChatOpen(true)}
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg shadow-red-500/50 animate-bounce border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
        {mobileChatOpen && (
          <motion.div
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-50 flex flex-col bg-linear-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl p-0 md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-blue-500/30 bg-slate-900/90 backdrop-blur-md">
              <span className="font-bold text-lg bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Room Chat
              </span>
              <button
                onClick={() => setMobileChatOpen(false)}
                className="text-white hover:text-red-400 text-3xl px-2 transition-colors duration-200 hover:scale-110"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Chat content placeholder */}
              <div className="text-center text-slate-400">
                Chat goes here...
              </div>
            </div>
            <div className="p-4 border-t border-blue-500/30 bg-slate-900/90 backdrop-blur-md flex gap-2">
              <input
                className="flex-1 bg-slate-800/90 rounded-xl px-4 py-2.5 text-white border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="Type a message..."
              />
              <button className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </>

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roomId={String(room.id)}
      />
    </div>
  );
}
