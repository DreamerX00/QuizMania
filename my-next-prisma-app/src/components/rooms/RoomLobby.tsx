import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomAvatarGrid from './RoomAvatarGrid';
import RoomInfoPanel from './RoomInfoPanel';
import RoomHostControls from './RoomHostControls';

const playSound = (src: string) => {
  const a = new Audio(src);
  a.currentTime = 0;
  a.play();
};

function ParticleBurst({ x, y, keyId }: { x: number; y: number; keyId: string }) {
  // Simple burst of 8 particles
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 2 }}
      transition={{ duration: 0.8 }}
      style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: ['#60a5fa', '#a78bfa', '#f472b6', '#22c55e'][i % 4],
            left: 0,
            top: 0,
            transform: `rotate(${i * 45}deg) translate(0, -24px)`
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.5 }}
          transition={{ duration: 0.8 }}
        />
      ))}
    </motion.div>
  );
}

export default function RoomLobby({ room, user }: { room: any, user: any }) {
  const isHost = room.host === user.name;
  const [players, setPlayers] = useState(room.players);
  const [particles, setParticles] = useState<{ x: number; y: number; keyId: string }[]>([]);
  const [chat, setChat] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Simulate player join/leave for demo
  useEffect(() => {
    // Simulate a player joining after 2s
    const joinTimeout = setTimeout(() => {
      const newPlayer = { name: 'Glitch', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Glitch', isHost: false, isSpeaking: false };
      setPlayers(p => [...p, newPlayer]);
      playSound('/game_arena/notification.mp3');
      // Show particles at random x/y
      setParticles(p => [...p, { x: 120 + Math.random() * 200, y: 80 + Math.random() * 80, keyId: 'join-' + Date.now() }]);
    }, 2000);
    // Simulate a player leaving after 6s
    const leaveTimeout = setTimeout(() => {
      setPlayers(p => p.filter(pl => pl.name !== 'Nova'));
      playSound('/game_arena/remove.mp3');
    }, 6000);
    return () => {
      clearTimeout(joinTimeout);
      clearTimeout(leaveTimeout);
    };
  }, []);

  // Remove particles after animation
  useEffect(() => {
    if (particles.length > 0) {
      const timeout = setTimeout(() => setParticles([]), 900);
      return () => clearTimeout(timeout);
    }
  }, [particles]);

  // Chat send handler
  const handleSend = () => {
    if (!chatInput.trim()) return;
    setChat(c => [...c, chatInput]);
    setChatInput('');
    playSound('/game_arena/send_message.mp3');
  };

  // Invite handler (stub)
  const handleInvite = () => {
    playSound('/game_arena/invite.mp3');
    alert('Invite sent!');
  };

  // Start match handler (stub)
  const handleStartMatch = () => {
    playSound('/game_arena/start_match.mp3');
    alert('Match started!');
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="flex flex-col md:flex-row gap-6 w-full h-full p-6 relative">
      {/* Animated Particles */}
      {particles.map(p => <ParticleBurst key={p.keyId} x={p.x} y={p.y} keyId={p.keyId} />)}
      {/* Left: Avatar Grid */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <RoomAvatarGrid players={players} host={room.host} teamMode={room.type === 'Squad' || room.type === 'Custom'} />
      </div>
      {/* Right: Info Panel + Controls */}
      <div className="flex-1 flex flex-col gap-4">
        <RoomInfoPanel room={room} isHost={isHost} />
        {isHost && <RoomHostControls room={room} onInvite={handleInvite} onStartMatch={handleStartMatch} />}
        {/* Chat Box */}
        <div className="flex-1 bg-slate-900/60 rounded-xl p-4 mt-4 text-slate-300 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2">
            {chat.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-slate-800/80 rounded-lg px-3 py-2 text-white w-fit">
                {msg}
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 bg-slate-800/80 rounded-lg px-3 py-2 text-white border border-slate-700"
              placeholder="Type a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg" onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 