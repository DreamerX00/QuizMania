import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCopy, CheckCircle2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const playSound = (src: string) => {
  const a = new Audio(src);
  a.currentTime = 0;
  a.play();
};

export default function RoomInfoPanel({ room, isHost }: { room: any, isHost?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const startCountdown = () => {
    if (countdown) return;
    setCountdown(10); // 10 seconds for demo
    playSound('/game_arena/notification.mp3');
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timerRef.current!);
          playSound('/game_arena/start_match.mp3');
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
      className="relative bg-gradient-to-br from-[#23234d]/80 to-[#0f1021]/90 rounded-2xl border border-blue-400/30 shadow-lg p-4 sm:p-6 mb-4 flex flex-col gap-4"
      style={{ boxShadow: '0 0 32px 4px #3b82f655, 0 0 0 1.5px #a78bfa55' }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#23234d]/90 to-transparent rounded-t-2xl pb-2 mb-2 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-purple-300 drop-shadow-glow">{room.title}</span>
          <button onClick={handleCopy} className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-200">
            {copied ? <CheckCircle2 className="text-green-400" /> : <ClipboardCopy />}
            <span className="text-xs">{room.code}</span>
          </button>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="ml-4 flex flex-col items-center">
            <QRCodeCanvas value={room.code} size={48} bgColor="#23234d" fgColor="#a78bfa" level="H" includeMargin={false} />
            <span className="text-xs text-slate-400 mt-1">Scan to Join</span>
          </motion.div>
        </div>
        {/* Info row: always visible, never cut off */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-300 text-sm w-full mt-2">
          <div className="flex-1 min-w-[120px] flex items-center gap-1">
            <span className="font-semibold text-white">Host:</span>
            <span className="truncate">{room.host}</span>
          </div>
          <div className="flex-1 min-w-[90px] flex items-center gap-1">
            <span className="font-semibold text-white">Type:</span>
            <span className="truncate">{room.type}</span>
          </div>
          <div className="flex-1 min-w-[90px] flex items-center gap-1">
            <span className="font-semibold text-white">Players:</span>
            <span>{room.players.length}/{room.maxPlayers}</span>
          </div>
          <div className="flex-1 min-w-[120px] flex items-center gap-1">
            <span className="font-semibold text-white">Quiz:</span>
            <span className="truncate break-all max-w-[120px]">{room.quizTypes && room.quizTypes.length > 0 ? room.quizTypes.join(', ') : '—'}</span>
          </div>
        </div>
        {/* Countdown Timer */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mt-2 flex items-center gap-3">
              <span className="text-lg font-bold text-green-400 animate-pulse">Match starts in:</span>
              <span className="text-2xl font-mono text-yellow-300 animate-bounce">{countdown}</span>
              {isHost && <button onClick={cancelCountdown} className="ml-4 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Cancel</button>}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Host Controls for Countdown */}
        {isHost && countdown === null && (
          <div className="mt-2 flex gap-2">
            <button onClick={startCountdown} className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700">Start Countdown</button>
          </div>
        )}
      </div>
      {/* Info/controls/chat/footer will be rendered below sticky header */}
    </motion.div>
  );
} 