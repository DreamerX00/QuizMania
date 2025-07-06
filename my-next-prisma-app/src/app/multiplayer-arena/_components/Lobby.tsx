"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Mic, Plus, Crown, Sparkles, Users } from 'lucide-react';
import InviteModal from '../components/InviteModal';
import toast from 'react-hot-toast';

const Lobby = ({ participants, currentRoom, gameState }: { 
  participants: Map<string, any>; 
  currentRoom: any; 
  gameState: string; 
}) => {
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // Convert participants Map to array for rendering
    const participantsArray = Array.from(participants.values());
    const filledSlots = participantsArray.length;

    const playSound = (src: string) => {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
      } else {
        audioRef.current.src = src;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    };

    useEffect(() => {
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }, []);

    const handleInviteClick = () => {
      setInviteModalOpen(true);
      playSound('/game_arena/invite.mp3');
    };

    const handleStartMatch = () => {
      playSound('/game_arena/start_match.mp3');
      toast.success('Match started!');
      // TODO: Implement match start logic with real API
    };



  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-4 flex flex-col text-gray-900 dark:text-white border dark:border-slate-700"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Battle Lobby
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Users size={16} />
          <span>{filledSlots}/5 Players</span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3 flex-1 items-center">
          {participantsArray.length === 0 ? (
            <div className="col-span-5 flex flex-col items-center justify-center h-full text-slate-400">No players in lobby.</div>
          ) : (
            participantsArray.map((participant: any, index: number) => (
              <div key={participant.id} className="flex flex-col items-center gap-1">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center relative bg-slate-200 dark:bg-slate-800/80 border-2 ${participant.isLeader ? 'border-yellow-400' : 'border-slate-300 dark:border-slate-600'}`}>
                  <img src={participant.avatar || '/default_avatar.png'} alt={participant.name} className="w-18 h-18 rounded-full p-1" />
                  {participant.isLeader && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 p-1 rounded-full">
                      <Crown size={12} />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{participant.name}</p>
              </div>
            ))
          )}
          {/* Show empty slots */}
          {Array.from({ length: Math.max(0, 5 - participantsArray.length) }, (_, index) => (
              <div key={`empty-${index}`} className="flex flex-col items-center gap-1" onClick={handleInviteClick}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/70 transition-colors">
                  <Plus size={24} className="text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">Empty</p>
              </div>
          ))}
      </div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button size="lg" className="w-1/2 mx-auto bg-purple-600 hover:bg-purple-700 text-lg font-bold flex items-center gap-2 rounded-full shadow-lg shadow-purple-600/30" onClick={handleStartMatch}>
            <Sparkles size={20}/> START MATCH
        </Button>
      </motion.div>
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </motion.div>
  );
};

export default Lobby; 