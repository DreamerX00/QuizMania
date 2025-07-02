import React from 'react';
import { motion } from 'framer-motion';
import { UserMinus, Lock, Users, Sparkles, Play } from 'lucide-react';

export default function RoomHostControls({ room }: { room: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-slate-900/70 rounded-xl p-4 border border-yellow-500 mb-2 flex flex-col gap-2">
      <div className="flex flex-col md:flex-row gap-3 flex-wrap">
        <button className="flex items-center gap-1 px-4 py-2 min-w-[120px] rounded bg-red-600 text-white hover:bg-red-700"><UserMinus size={16}/>Kick</button>
        <button className="flex items-center gap-1 px-4 py-2 min-w-[120px] rounded bg-blue-600 text-white hover:bg-blue-700"><Users size={16}/>Invite</button>
        <button className="flex items-center gap-1 px-4 py-2 min-w-[120px] rounded bg-gray-700 text-white hover:bg-gray-800"><Lock size={16}/>Lock Room</button>
        <button className="flex items-center gap-1 px-4 py-2 min-w-[120px] rounded bg-purple-600 text-white hover:bg-purple-700"><Sparkles size={16}/>Set Quiz Type</button>
        <button className="flex items-center gap-1 px-4 py-2 min-w-[120px] rounded bg-green-600 text-white hover:bg-green-700"><Play size={16}/>Start Match</button>
      </div>
    </motion.div>
  );
} 