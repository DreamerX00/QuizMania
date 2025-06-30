"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart } from 'lucide-react';
import RankModal from '../components/RankModal';
import RankCard from '../components/RankCard';
import { getRankByXP } from '@/utils/rank';

const userXP = 685_000; // Sample: halfway through Ascendrix

// Simple confetti animation using framer-motion
const Confetti = ({ show }: { show: boolean }) => (
  <>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="absolute left-1/2 top-0 z-20 -translate-x-1/2 pointer-events-none"
      >
        <span className="text-5xl select-none">🎉✨🎊</span>
      </motion.div>
    )}
  </>
);

const ThreeDBadgePlaceholder = ({ rankName }: { rankName: string }) => (
  <div className="mt-6 flex flex-col items-center">
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200 via-purple-400 to-blue-400 shadow-2xl flex items-center justify-center animate-pulse border-4 border-white/20">
      <span className="text-4xl">🏅</span>
    </div>
    <div className="text-xs text-slate-400 mt-2">3D Badge Coming Soon for {rankName}</div>
  </div>
);

const RankAndCareer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevRank = useRef(getRankByXP(userXP).current.name);
  const rankInfo = getRankByXP(userXP);

  useEffect(() => {
    if (prevRank.current !== rankInfo.current.name) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      prevRank.current = rankInfo.current.name;
    }
  }, [rankInfo.current.name]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-6 flex flex-col justify-between text-gray-900 dark:text-white border dark:border-slate-700 relative"
      >
        <div className="flex flex-col items-center justify-center w-full">
          <Confetti show={showConfetti} />
          <RankCard xp={userXP} className="w-full max-w-md mx-auto" />
          <ThreeDBadgePlaceholder rankName={rankInfo.current.name} />
        </div>
        <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2"
        >
            View Full Stats
        </Button>
      </motion.div>
      <RankModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} xp={userXP} />
    </>
  );
};

export default RankAndCareer; 