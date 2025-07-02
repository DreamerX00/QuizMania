import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Mic, MicOff, Volume2, Users } from 'lucide-react';
import { getRankByXP } from '@/utils/rank';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';

const playSound = (src: string) => {
  const a = new Audio(src);
  a.currentTime = 0;
  a.play();
};

export default function RoomAvatarGrid({ players, host, teamMode = false }: { players: any[], host: string, teamMode?: boolean }) {
  // Mock team state for demo
  const [teamA, setTeamA] = useState(players.filter((_, i) => i % 2 === 0));
  const [teamB, setTeamB] = useState(players.filter((_, i) => i % 2 !== 0));

  const handleMove = (player: any, toTeam: 'A' | 'B') => {
    if (toTeam === 'A') {
      setTeamB(b => b.filter(p => p.name !== player.name));
      setTeamA(a => [...a, player]);
    } else {
      setTeamA(a => a.filter(p => p.name !== player.name));
      setTeamB(b => [...b, player]);
    }
    playSound('/game_arena/mode_change.mp3');
  };

  // Avatar with host glow, voice ring, and rank glow
  const Avatar = ({ player }: { player: any }) => {
    const isHost = player.name === host;
    const xp = typeof player.xp === 'number' ? player.xp : 0;
    const rankInfo = getRankByXP(xp);
    const colorA = rankInfo.current.colorScheme[0];
    const colorB = rankInfo.current.colorScheme[1];
    return (
      <motion.div className="relative flex flex-col items-center">
        {/* Animated border/glow for host or always for rank */}
        <motion.div
          className="absolute z-10"
          style={{
            top: -6, left: -6, width: 56, height: 56, borderRadius: '50%',
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
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'loop' }}
        />
        {/* Voice ring */}
        {player.isSpeaking && (
          <motion.div
            className="absolute z-20"
            style={{
              top: -10, left: -10, width: 64, height: 64, borderRadius: '50%',
              border: '3px solid #22c55e',
              boxShadow: '0 0 16px 4px #22c55e88',
            }}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
        {/* Avatar image */}
        <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full border-2 shadow relative z-30" style={{ borderColor: colorA }} />
        {/* Host crown */}
        {isHost && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 p-1 rounded-full z-30 shadow-lg" title="Host">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 17l-3-9 7 6 3-8 3 8 7-6-3 9z"/></svg>
          </span>
        )}
        {/* Rank emoji badge */}
        <span className="absolute -top-2 left-0 text-2xl select-none z-30" title={rankInfo.current.name}>{rankInfo.current.emoji}</span>
        {/* Rank label */}
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg" style={{ background: colorB, color: '#fff', border: `1.5px solid ${colorA}` }}>{rankInfo.current.name}</span>
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
                  key={player.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-center bg-slate-800/70 rounded-xl p-3 shadow-lg border border-slate-700 gap-3"
                  draggable
                  onDragStart={e => e.dataTransfer.setData('player', player.name)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const name = e.dataTransfer.getData('player');
                    const p = [...teamB, ...teamA].find(p => p.name === name);
                    if (p && !teamA.some(x => x.name === name)) handleMove(p, 'A');
                  }}
                >
                  <Avatar player={player} />
                  <span className="font-bold text-white text-lg ml-3">{player.name}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {player.isSpeaking ? <Mic className="text-green-400 animate-pulse" /> : <MicOff className="text-gray-500" />}
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
                  key={player.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative flex items-center bg-slate-800/70 rounded-xl p-3 shadow-lg border border-slate-700 gap-3"
                  draggable
                  onDragStart={e => e.dataTransfer.setData('player', player.name)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const name = e.dataTransfer.getData('player');
                    const p = [...teamB, ...teamA].find(p => p.name === name);
                    if (p && !teamB.some(x => x.name === name)) handleMove(p, 'B');
                  }}
                >
                  <Avatar player={player} />
                  <span className="font-bold text-white text-lg ml-3">{player.name}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {player.isSpeaking ? <Mic className="text-green-400 animate-pulse" /> : <MicOff className="text-gray-500" />}
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

  // Non-team mode UI
  return (
    <div className="flex flex-wrap gap-4 justify-center items-center py-4">
      <AnimatedTooltip
        items={players.map((player, idx) => ({
          id: idx,
          name: player.name,
          designation: player.isHost ? 'Host' : 'Player',
          image: player.avatar,
        }))}
      />
    </div>
  );
}
// TODO: Add QR code to RoomInfoPanel for invite (use qrcode.react or similar) 