"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Vote, Puzzle, FileText, Mic, CheckSquare } from 'lucide-react';
import VoteTypesDialog from '../components/VoteTypesDialog';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const voteTypes = [
  { name: 'MCQ', icon: <CheckSquare size={28}/> },
  { name: 'True/False', icon: <Puzzle size={28}/> },
  { name: 'Match', icon: <Puzzle size={28}/> },
  { name: 'Ordering', icon: <FileText size={28}/> },
];

const VotingSystem = ({ roomId }: { roomId: string }) => {
  const [showDialog, setShowDialog] = useState(false);
  const { data, error, isLoading, mutate } = useSWR(roomId ? `/api/votes?roomId=${roomId}` : null, fetcher, { refreshInterval: 5000 });

  const handleVote = async (type: string) => {
    try {
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, type }),
      });
      mutate();
      toast.success(`Voted for ${type}!`);
    } catch {
      toast.error('Failed to vote.');
    }
  };

  const votes = data?.votes || [];
  const getVoteCount = (type: string) => votes.find((v: any) => v.type === type)?.count || 0;

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
        {voteTypes.map((option) => (
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
                animate={{ width: `${(getVoteCount(option.name) / Math.max(1, votes.reduce((a: number, v: any) => a + v.count, 0))) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{getVoteCount(option.name)}</p>
            <Button size="sm" className="w-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border-none" onClick={() => handleVote(option.name)}>
              Vote
            </Button>
          </motion.div>
        ))}
      </div>
      {isLoading && <div className="text-slate-400 mt-2">Loading votes...</div>}
      {error && <div className="text-red-500 mt-2">Failed to load votes.</div>}
      <div className="flex justify-end mt-4">
        <Button onClick={() => { setShowDialog(true); toast('Viewing all vote types...'); }} className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-lg shadow">
          View All
        </Button>
      </div>
      <VoteTypesDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />
    </motion.div>
  );
};

export default VotingSystem; 