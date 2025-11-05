"use client";
import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Vote,
  Puzzle,
  FileText,
  Mic,
  CheckSquare,
  Target,
  Zap,
  Flame,
  Clock,
  Trophy,
} from "lucide-react";
import VoteTypesDialog from "../components/VoteTypesDialog";
import toast from "react-hot-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const voteTypes = [
  {
    name: "MCQ",
    icon: <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    name: "True/False",
    icon: <Puzzle className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    name: "Match",
    icon: <Target className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-500/10 to-emerald-500/10",
    borderColor: "border-green-500/30",
  },
  {
    name: "Ordering",
    icon: <FileText className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-500/10 to-red-500/10",
    borderColor: "border-orange-500/30",
  },
];

const VotingSystem = memo(function VotingSystem({
  roomId,
}: {
  roomId: string;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const { data, error, isLoading, mutate } = useSWR(
    roomId ? `/api/votes?roomId=${roomId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const handleVote = async (type: string) => {
    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, type }),
      });
      mutate();
      toast.success(`Voted for ${type}!`);
    } catch {
      toast.error("Failed to vote.");
    }
  };

  const votes = data?.votes || [];
  const getVoteCount = (type: string) =>
    votes.find((v: any) => v.type === type)?.count || 0;
  const totalVotes = votes.reduce((a: number, v: any) => a + v.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-gradient-to-br from-white/80 via-blue-50/80 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 rounded-3xl p-4 sm:p-6 flex flex-col text-gray-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Vote className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Match Type Vote
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Choose your battle format
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-orange-500">24s</span> left
          </span>
        </div>
      </div>

      {/* Vote Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1">
        {voteTypes.map((option, index) => (
          <motion.div
            key={option.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${option.bgColor} border ${option.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <div
                className={`text-white bg-gradient-to-br ${option.color} bg-clip-text text-transparent`}
              >
                {option.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 text-center">
              {option.name}
            </h3>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-2 relative overflow-hidden">
              <motion.div
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${option.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (getVoteCount(option.name) / Math.max(1, totalVotes)) * 100
                  }%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* Vote Count */}
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                {getVoteCount(option.name)}
              </span>
            </div>

            {/* Vote Button */}
            <Button
              size="sm"
              className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white font-semibold border-none shadow-lg transition-all duration-300 group-hover:shadow-xl`}
              onClick={() => handleVote(option.name)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Vote
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="relative z-10 flex items-center justify-center mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Loading votes...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="relative z-10 flex items-center justify-center mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <div className="text-center">
            <Flame className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400 text-sm">
              Failed to load votes.
            </p>
          </div>
        </div>
      )}

      {/* View All Button */}
      <div className="relative z-10 flex justify-end mt-4">
        <Button
          onClick={() => {
            setShowDialog(true);
            toast("Viewing all vote types...");
          }}
          className="bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Target className="w-4 h-4 mr-2" />
          View All Types
        </Button>
      </div>

      <VoteTypesDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </motion.div>
  );
});

export default VotingSystem;
