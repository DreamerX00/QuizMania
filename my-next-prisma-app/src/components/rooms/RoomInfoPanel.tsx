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
    navigator.clipboard.writeText(room.id);
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-slate-900/70 rounded-xl p-4 border border-blue-500 mb-6 flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-purple-300">{room.title}</span>
        <button onClick={handleCopy} className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-200">
          {copied ? <CheckCircle2 className="text-green-400" /> : <ClipboardCopy />}
          <span className="text-xs">{room.id}</span>
        </button>
        {/* QR Code */}
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="ml-4 flex flex-col items-center">
            <QRCodeCanvas value={room.id} size={48} bgColor="#23234d" fgColor="#a78bfa" level="H" includeMargin={false} />
            <span className="text-xs text-slate-400 mt-1">Scan to Join</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-4 text-slate-300 text-sm">
        <span>Host: <span className="font-semibold text-white">{room.host}</span></span>
        <span>Type: {room.type}</span>
        <span>Players: {room.players.length}/{room.maxPlayers}</span>
        <span>Quiz: {room.quizTypes.join(', ')}</span>
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
    </motion.div>
  );
} 