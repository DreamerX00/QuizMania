"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Vote, Puzzle, FileText, Mic, CheckSquare } from 'lucide-react';
import VoteTypesDialog from '../components/VoteTypesDialog';

const VotingSystem = () => {
    const [showDialog, setShowDialog] = useState(false);
    const voteOptions = [
        { name: 'MCQ', icon: <CheckSquare size={28}/>, votes: 3 },
        { name: 'True/False', icon: <Puzzle size={28}/>, votes: 1 },
        { name: 'Match', icon: <Puzzle size={28}/>, votes: 0 },
        { name: 'Ordering', icon: <FileText size={28}/>, votes: 1 },
    ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-4 flex flex-col text-gray-900 dark:text-white border dark:border-slate-700"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Match Type Vote
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Voting ends in: <span className="font-bold text-purple-500">24s</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {voteOptions.map((option) => (
          <motion.div
            key={option.name}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
          >
            <div className="text-2xl">{option.icon}</div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{option.name}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700/80 rounded-full h-2.5 relative">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(option.votes / 5) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{option.votes}</p>
            <Button size="sm" className="w-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border-none">
              Vote
            </Button>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={() => setShowDialog(true)} className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-lg shadow">
          View All
        </Button>
      </div>
      <VoteTypesDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />
    </motion.div>
  );
};

export default VotingSystem; 