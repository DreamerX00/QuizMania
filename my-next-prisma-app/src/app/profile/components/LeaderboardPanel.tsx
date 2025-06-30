import React from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

export function LeaderboardPanel() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  // Fetch global leaderboard
  const { data: globalData, isLoading: loadingGlobal } = useSWR(
    user && token ? [`/api/leaderboard`, token] : null,
    ([url, token]) => fetcher(url, token)
  );
  // Fetch local leaderboard (by region)
  const { data: localData, isLoading: loadingLocal } = useSWR(
    user && token && user.region ? [`/api/leaderboard?region=${user.region}`, token] : null,
    ([url, token]) => fetcher(url, token)
  );

  if (loadingGlobal || !globalData) {
    return <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#23234d]/80 rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[180px]" />;
  }

  const global = Array.isArray(globalData) ? globalData : [];
  const local = Array.isArray(localData) ? localData : [];
  // Find current user in leaderboard
  const globalRank = global.findIndex((u: any) => u.id === user?.id) + 1;
  const localRank = local.findIndex((u: any) => u.id === user?.id) + 1;

  // For the chart, use XP as the metric
  const rankData = global.map((u: any, i: number) => ({
    name: u.name || `User ${i + 1}`,
    xp: u.xp || 0,
  }));

  return (
    <motion.div
      className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row gap-4 md:gap-8 items-center border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 right-1/2 translate-x-1/2 w-16 h-16 bg-gradient-to-br from-green-400/10 to-blue-400/10 dark:from-green-400/20 dark:to-blue-400/20 rounded-full blur-2xl animate-float z-0" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '2s' }} />
      <div className="flex-1 z-10 min-w-0">
        <div className="flex gap-4 md:gap-8 flex-wrap">
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400 drop-shadow-glow">{globalRank > 0 ? `#${globalRank}` : <span className='text-gray-500 dark:text-gray-500'>--</span>}</span>
            <span className="text-xs text-gray-600 dark:text-white/60">Global</span>
          </div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 drop-shadow-glow">{localRank > 0 ? `#${localRank}` : <span className='text-gray-500 dark:text-gray-500'>--</span>}</span>
            <span className="text-xs text-gray-600 dark:text-white/60">Local</span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-48 h-32 z-10 flex items-center justify-center">
        {rankData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rankData}>
              <XAxis dataKey="name" stroke="#8884d8" hide />
              <YAxis stroke="#8884d8" />
              <Line type="monotone" dataKey="xp" stroke="#34d399" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">No leaderboard data</div>
        )}
        <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 mt-2">XP Leaderboard</div>
      </div>
    </motion.div>
  );
} 