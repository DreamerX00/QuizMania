import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Users, UserMinus } from "lucide-react";
import { getRankByXP } from "@/utils/rank";
import { toast } from "react-hot-toast";

const playSound = (src: string) => {
  const a = new Audio(src);
  a.currentTime = 0;
  a.play();
};

interface Player {
  id: string;
  name: string;
  avatar: string;
  muted?: boolean;
  isSpeaking?: boolean;
  online?: boolean;
  xp?: number;
  rank?: string;
  clerkId?: string;
}

interface RoomAvatarGridProps {
  players: Player[];
  hostId: string;
  teamMode?: boolean;
  user?: { userId: string };
  room?: { id: string };
}

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
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  hash = Math.abs(hash);
  return fallbackAvatars[hash % fallbackAvatars.length];
}

export default function RoomAvatarGrid({
  players,
  hostId,
  teamMode = false,
  user,
  room,
}: RoomAvatarGridProps) {
  // Mock team state for demo
  const [teamA, setTeamA] = useState(players.filter((_, i) => i % 2 === 0));
  const [teamB, setTeamB] = useState(players.filter((_, i) => i % 2 !== 0));
  // Tooltip state
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleMove = (player: Player, toTeam: "A" | "B") => {
    if (toTeam === "A") {
      setTeamB((b) => b.filter((p) => p.name !== player.name));
      setTeamA((a) => [...a, player]);
    } else {
      setTeamA((a) => a.filter((p) => p.name !== player.name));
      setTeamB((b) => [...b, player]);
    }
    playSound("/game_arena/mode_change.mp3");
  };

  // Avatar with host glow, voice ring, and rank glow
  const Avatar = ({ player }: { player: Player }) => {
    const isHost = player.id === hostId;
    const xp = typeof player.xp === "number" ? player.xp : 0;
    const rankInfo = getRankByXP(xp);
    const colorA = rankInfo.current.colorScheme[0];
    const colorB = rankInfo.current.colorScheme[1];
    // Fallback logic
    const avatarUrl =
      player.avatar && player.avatar.trim() !== ""
        ? player.avatar
        : getRandomAvatar(player.id || player.name || Math.random().toString());
    return (
      <motion.div className="relative flex flex-col items-center">
        {/* Animated border/glow for host or always for rank */}
        <motion.div
          className="absolute z-10"
          style={{
            top: -6,
            left: -6,
            width: 56,
            height: 56,
            borderRadius: "50%",
            boxShadow: `0 0 32px 8px ${colorA}99, 0 0 64px 16px ${colorB}55`,
            border: `2.5px solid ${colorA}`,
          }}
          animate={{
            boxShadow: [
              `0 0 32px 8px ${colorA}99, 0 0 64px 16px ${colorB}55`,
              `0 0 48px 16px ${colorB}99, 0 0 80px 24px ${colorA}55`,
              `0 0 32px 8px ${colorA}99, 0 0 64px 16px ${colorB}55`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "loop" }}
        />
        {/* Voice ring */}
        {player.isSpeaking && (
          <motion.div
            className="absolute z-20"
            style={{
              top: -10,
              left: -10,
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3px solid #22c55e",
              boxShadow: "0 0 16px 4px #22c55e88",
            }}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
        {/* Avatar image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={player.name}
          className="w-12 h-12 rounded-full border-2 shadow relative z-30"
          style={{ borderColor: colorA }}
        />
        {/* Host crown */}
        {isHost && (
          <span
            className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 p-1 rounded-full z-30 shadow-lg"
            title="Host"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 17l-3-9 7 6 3-8 3 8 7-6-3 9z" />
            </svg>
          </span>
        )}
        {/* Rank emoji badge */}
        <span
          className="absolute -top-2 left-0 text-2xl select-none z-30"
          title={rankInfo.current.name}
        >
          {rankInfo.current.emoji}
        </span>
        {/* Rank label */}
        <span
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg"
          style={{
            background: colorB,
            color: "#fff",
            border: `1.5px solid ${colorA}`,
          }}
        >
          {rankInfo.current.name}
        </span>
      </motion.div>
    );
  };

  // Team mode UI
  if (teamMode) {
    return (
      <div className="flex gap-8 w-full justify-center">
        {/* Team A */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-blue-400" />
            <span className="font-bold text-blue-300">Team A</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {teamA.map((player, i) => (
                <motion.div
                  key={player.id || player.clerkId || `${player.name}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-center bg-slate-800/70 rounded-xl p-3 shadow-lg border border-slate-700 gap-3"
                  draggable
                  onDragStart={(e) =>
                    (e as unknown as React.DragEvent).dataTransfer.setData(
                      "player",
                      player.name
                    )
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const dragEvent = e as unknown as React.DragEvent;
                    const name = dragEvent.dataTransfer.getData("player");
                    const p = [...teamB, ...teamA].find((p) => p.name === name);
                    if (p && !teamA.some((x) => x.name === name))
                      handleMove(p, "A");
                  }}
                >
                  <Avatar player={player} />
                  <span className="font-bold text-white text-lg ml-3">
                    {player.name}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    {player.isSpeaking ? (
                      <Mic className="text-green-400 animate-pulse" />
                    ) : (
                      <MicOff className="text-gray-500" />
                    )}
                    <Volume2 className="text-blue-400" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {/* Team B */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-pink-400" />
            <span className="font-bold text-pink-300">Team B</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {teamB.map((player, i) => (
                <motion.div
                  key={player.id || player.clerkId || `${player.name}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-center bg-slate-800/70 rounded-xl p-3 shadow-lg border border-slate-700 gap-3"
                  draggable
                  onDragStart={(e) =>
                    (e as unknown as React.DragEvent).dataTransfer.setData(
                      "player",
                      player.name
                    )
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const dragEvent = e as unknown as React.DragEvent;
                    const name = dragEvent.dataTransfer.getData("player");
                    const p = [...teamB, ...teamA].find((p) => p.name === name);
                    if (p && !teamB.some((x) => x.name === name))
                      handleMove(p, "B");
                  }}
                >
                  <Avatar player={player} />
                  <span className="font-bold text-white text-lg ml-3">
                    {player.name}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    {player.isSpeaking ? (
                      <Mic className="text-green-400 animate-pulse" />
                    ) : (
                      <MicOff className="text-gray-500" />
                    )}
                    <Volume2 className="text-pink-400" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Responsive avatar size
  let avatarSize = 64;
  if (players.length < 3) avatarSize = 80;
  if (players.length > 20) avatarSize = 48;

  // Grid config
  const isScrollable = players.length > 24;
  const gridCols = Math.min(5, players.length);
  const gridColsClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
    }[gridCols] || "grid-cols-5";

  // Centering logic
  const containerClass =
    players.length < 6
      ? "flex flex-col items-center justify-center h-full w-full"
      : "flex flex-col items-center w-full pt-4";

  // Avatar actions
  const handleMute = async (player: Player) => {
    try {
      const response = await fetch(`/api/rooms/voice/mute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room?.id,
          playerId: player.id,
          muted: !player.muted,
        }),
      });

      if (response.ok) {
        toast.success(
          player.muted ? `Unmuted ${player.name}` : `Muted ${player.name}`
        );
        // Update local state or trigger refresh
      } else {
        toast.error("Failed to update mute status");
      }
    } catch (error) {
      console.error("Error updating mute status:", error);
      toast.error("Failed to update mute status");
    }
  };

  const handleKick = async (player: Player) => {
    if (
      !confirm(`Are you sure you want to kick ${player.name} from the room?`)
    ) {
      return;
    }

    console.log("Kick request data:", {
      roomId: room?.id,
      playerId: player.id,
      playerName: player.name,
      room: room,
    });

    if (!room?.id) {
      toast.error("Room ID is missing");
      return;
    }

    if (!player.id) {
      toast.error("Player ID is missing");
      return;
    }

    try {
      const response = await fetch(`/api/rooms/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          userId: player.id,
        }),
      });

      if (response.ok) {
        toast.success(`Kicked ${player.name} from the room`);
        // Update local state or trigger refresh
      } else {
        const errorData = await response.json();
        console.error("Kick failed:", errorData);
        toast.error(errorData.error || "Failed to kick player");
      }
    } catch (error) {
      console.error("Error kicking player:", error);
      toast.error("Failed to kick player");
    }
  };

  return (
    <div
      className={
        containerClass +
        " transition-all duration-300 " +
        (isScrollable
          ? "overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-blue-500/40"
          : "")
      }
      style={{ minHeight: 200 }}
    >
      <div
        className={`grid ${gridColsClass} gap-4 md:gap-6 w-full justify-center items-center`}
        style={{
          maxWidth: gridCols * (avatarSize + 32),
          margin: "0 auto",
        }}
      >
        {players.map((player, idx) => (
          <motion.div
            key={player.id || player.clerkId || `${player.name}-${idx}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: idx * 0.04,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="relative flex flex-col items-center group"
            style={{ minWidth: avatarSize, minHeight: avatarSize + 32 }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onTouchStart={() => setHoveredIdx(idx)}
            onTouchEnd={() => setHoveredIdx(null)}
          >
            {/* Avatar image with status dot */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={player.avatar}
                alt={player.name}
                className={`rounded-full border-2 shadow-lg object-cover transition-all duration-300 ${
                  player.id === hostId
                    ? "border-yellow-400"
                    : "border-blue-500/40"
                } bg-slate-800`}
                style={{ width: avatarSize, height: avatarSize }}
              />
              {/* Online/connected status dot */}
              <span
                className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 ${
                  player.online ? "bg-green-400" : "bg-red-400"
                } border-white`}
              ></span>
              {/* Host badge */}
              {player.id === hostId && (
                <span
                  className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 p-1 rounded-full z-30 shadow-lg"
                  title="Host"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 17l-3-9 7 6 3-8 3 8 7-6-3 9z" />
                  </svg>
                </span>
              )}
            </div>
            {/* Tooltip on hover/tap */}
            {hoveredIdx === idx && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="absolute z-50 -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center rounded-xl px-4 py-3 min-w-[180px] shadow-2xl border border-blue-400/40 bg-linear-to-br from-[#23234d]/90 to-[#0f1021]/90 backdrop-blur-lg"
                style={{ pointerEvents: "none" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-8 h-8 rounded-full border-2 border-blue-400"
                  />
                  <span className="font-bold text-white text-base">
                    {player.name}
                  </span>
                  {player.id === hostId && (
                    <span className="ml-1 bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      Host
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {/* Rank badge (stubbed) */}
                  <span className="text-xs text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full">
                    Rank: {player.rank || "N/A"}
                  </span>
                  {/* Online status */}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      player.online ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></span>
                </div>
                <div className="flex gap-2 mt-1 items-center justify-center">
                  <button
                    className="text-blue-400 hover:text-blue-600 transition"
                    onClick={() => handleMute(player)}
                    title={player.muted ? "Unmute" : "Mute"}
                  >
                    {player.muted ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  {user && user.userId === hostId && player.id !== hostId && (
                    <button
                      className="text-red-400 hover:text-red-600 transition"
                      onClick={() => handleKick(player)}
                      title="Kick Player"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
            {/* Name/username */}
            <span className="mt-2 font-bold text-white text-sm text-center break-all w-full truncate max-w-[90px]">
              {player.name}
            </span>
            {/* Actions: mute/unmute, kick (host only) */}
            <div className="flex gap-2 mt-1 items-center justify-center">
              <button
                className="text-blue-400 hover:text-blue-600 transition"
                onClick={() => handleMute(player)}
                title={player.muted ? "Unmute" : "Mute"}
              >
                {player.muted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              {user && user.userId === hostId && player.id !== hostId && (
                <button
                  className="text-red-400 hover:text-red-600 transition"
                  onClick={() => handleKick(player)}
                  title="Kick Player"
                >
                  <UserMinus size={16} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
// TODO: Add QR code to RoomInfoPanel for invite (use qrcode.react or similar)

