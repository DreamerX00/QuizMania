"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Plus,
  Crown,
  Sparkles,
  Users,
  Sword,
  Target,
  Flame,
  Zap,
} from "lucide-react";
import InviteModal from "../components/InviteModal";
import toast from "react-hot-toast";
import Image from "next/image";

const Lobby = ({
  participants,
  currentRoom,
  gameState,
}: {
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
    playSound("/game_arena/invite.mp3");
  };

  const handleStartMatch = () => {
    playSound("/game_arena/start_match.mp3");
    toast.success("Match started!");
    // TODO: Implement match start logic with real API
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full bg-gradient-to-br from-white/80 via-blue-50/80 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 rounded-3xl p-6 flex flex-col text-gray-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl"></div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sword className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Battle Arena
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {filledSlots}/5
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-4 w-full max-w-2xl">
          {participantsArray.length === 0 ? (
            <div className="col-span-5 flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No warriors in arena
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Invite players to begin the battle
              </p>
            </div>
          ) : (
            participantsArray.map((participant: any, index: number) => (
              <motion.div
                key={participant.id}
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative group">
                  <div
                    className={`relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white to-slate-100 dark:from-slate-700 dark:to-slate-800 border-2 shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden ${
                      participant.isLeader
                        ? "border-yellow-400 shadow-yellow-400/30"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <Image
                        src={participant.avatar || "/default_avatar.png"}
                        alt={participant.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    {participant.isLeader && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1.5 rounded-full shadow-lg"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crown className="w-3 h-3" />
                      </motion.div>
                    )}
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                    {participant.name}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Ready
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Empty slots */}
          {Array.from(
            { length: Math.max(0, 5 - participantsArray.length) },
            (_, index) => (
              <motion.div
                key={`empty-${index}`}
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (participantsArray.length + index) * 0.1 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:scale-105 transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInviteClick}
                >
                  <Plus className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-purple-500 transition-colors" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    Empty
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Click to invite
                  </p>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* Start Match Button */}
      <div className="relative z-10 mt-6 flex justify-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <Button
            size="lg"
            className="relative px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-purple-600/30 border-0 overflow-hidden group"
            onClick={handleStartMatch}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 animate-pulse"></div>

            {/* Content */}
            <div className="relative flex items-center gap-3">
              <Flame className="w-5 h-5 group-hover:animate-bounce" />
              <span>START BATTLE</span>
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/20 to-cyan-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </Button>
        </motion.div>
      </div>

      <InviteModal
        roomId={currentRoom?.id || ""}
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </motion.div>
  );
};

export default Lobby;
