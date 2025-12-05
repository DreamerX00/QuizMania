import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCopy, CheckCircle2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const playSound = (src: string) => {
  const a = new Audio(src);
  a.currentTime = 0;
  a.play();
};

export default function RoomInfoPanel({
  room,
  isHost,
}: {
  room: { id: string; name?: string; [key: string]: unknown };
  isHost?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(room.code || ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const startCountdown = () => {
    if (countdown) return;
    setCountdown(10); // 10 seconds for demo
    playSound("/game_arena/notification.mp3");
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current!);
          playSound("/game_arena/start_match.mp3");
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    clearInterval(timerRef.current!);
    setCountdown(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="relative bg-linear-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 p-5 sm:p-6 mb-4 flex flex-col gap-4"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-linear-to-b from-slate-900/95 to-transparent backdrop-blur-md rounded-t-2xl pb-3 mb-3 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]">
            {String(room.title || room.name || "Room")}
          </span>
          <button
            onClick={handleCopy}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 hover:text-blue-200 transition-all duration-200 hover:scale-105"
          >
            {copied ? (
              <CheckCircle2 className="text-green-400 w-4 h-4" />
            ) : (
              <ClipboardCopy className="w-4 h-4" />
            )}
            <span className="text-sm font-mono font-semibold">
              {String(room.code || "")}
            </span>
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="ml-4 flex flex-col items-center"
          >
            <QRCodeCanvas
              value={String(room.code || "")}
              size={48}
              bgColor="#23234d"
              fgColor="#a78bfa"
              level="H"
              includeMargin={false}
            />
            <span className="text-xs text-slate-400 mt-1.5 font-medium">
              Scan to Join
            </span>
          </motion.div>
        </div>
        {/* Info row: always visible, never cut off */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 text-sm w-full mt-2">
          <div className="flex-1 min-w-[120px] flex items-center gap-1">
            <span className="font-semibold text-blue-300">Host:</span>
            <span className="truncate">{String(room.host || "")}</span>
          </div>
          <div className="flex-1 min-w-[90px] flex items-center gap-1">
            <span className="font-semibold text-blue-300">Type:</span>
            <span className="truncate">{String(room.type || "")}</span>
          </div>
          <div className="flex-1 min-w-[90px] flex items-center gap-1">
            <span className="font-semibold text-blue-300">Players:</span>
            <span>
              {Array.isArray(room.players) ? room.players.length : 0}/
              {String(room.maxPlayers || 0)}
            </span>
          </div>
          <div className="flex-1 min-w-[120px] flex items-center gap-1">
            <span className="font-semibold text-blue-300">Quiz:</span>
            <span className="truncate break-all max-w-[120px]">
              {Array.isArray(room.quizTypes) && room.quizTypes.length > 0
                ? room.quizTypes.join(", ")
                : "—"}
            </span>
          </div>
        </div>
        {/* Countdown Timer */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-3 flex items-center gap-3 p-3 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-green-500/30"
            >
              <span className="text-lg font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                Match starts in:
              </span>
              <span className="text-3xl font-mono font-bold bg-linear-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent animate-bounce">
                {countdown}
              </span>
              {isHost && (
                <button
                  onClick={cancelCountdown}
                  className="ml-auto px-4 py-2 rounded-xl bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-medium shadow-lg shadow-red-500/20 transition-all duration-300 hover:shadow-red-500/40 hover:scale-105"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Host Controls for Countdown */}
        {isHost && countdown === null && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={startCountdown}
              className="px-6 py-2 rounded-xl bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-medium shadow-lg shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 hover:scale-105"
            >
              Start Countdown
            </button>
          </div>
        )}
      </div>
      {/* Info/controls/chat/footer will be rendered below sticky header */}
    </motion.div>
  );
}
