import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mockRoomData = {
  id: '8QZ7KR',
  title: 'Quantum Quiz Room',
  host: 'QuantumLeap',
  players: [
    { name: 'QuantumLeap', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=QuantumLeap', isHost: true, isSpeaking: false },
    { name: 'Nova', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Nova', isHost: false, isSpeaking: true },
  ],
  maxPlayers: 8,
  type: 'Public',
  quizTypes: ['MCQ', 'True/False'],
};

export default function JoinRoomFlow({ onJoin }: { onJoin: (room: any) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = () => {
    setError('');
    if (code.length !== 6) {
      setError('Room code must be 6 characters.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (code.toUpperCase() === mockRoomData.id) {
        onJoin(mockRoomData);
      } else {
        setError('Room code not found or expired.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-2xl font-bold text-blue-400 mb-2">Join Room</h2>
      <Input
        placeholder="Enter 6-char Room ID (e.g. 8QZ7KR)"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        className="text-center text-xl tracking-widest bg-slate-900/60 border border-blue-500 text-white"
        disabled={loading}
      />
      <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full text-lg" onClick={handleJoin} disabled={loading}>
        {loading ? 'Joining...' : 'Join'}
      </Button>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="text-red-500 text-sm">
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 