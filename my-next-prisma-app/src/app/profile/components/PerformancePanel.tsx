import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f472b6"];

export function PerformancePanel() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR(
    user ? `/api/users/${user.id}/profile` : null,
    url => fetch(url).then(res => res.json())
  );

  if (isLoading || !data) {
    return <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[180px] border border-gray-200 dark:border-white/10" />;
  }

  const stats = data.stats || {};
  const performance = stats.performance || [];

  return (
    <motion.div
      className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row gap-4 md:gap-8 items-center border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-2xl animate-float z-0" />
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-green-400/10 to-blue-400/10 dark:from-green-400/20 dark:to-blue-400/20 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '2s' }} />
      <div className="flex-1 z-10 min-w-0">
        <div className="flex gap-4 md:gap-8 flex-wrap">
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 drop-shadow-glow">{stats.quizzesTaken ?? <span className='text-gray-500 dark:text-gray-500'>--</span>}</span>
            <span className="text-xs text-gray-600 dark:text-white/60">Quizzes</span>
          </div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-2xl font-bold text-pink-600 dark:text-pink-400 drop-shadow-glow">{stats.streak ?? <span className='text-gray-500 dark:text-gray-500'>--</span>}</span>
            <span className="text-xs text-gray-600 dark:text-white/60">🔥 Streak</span>
          </div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 drop-shadow-glow">{stats.timeSpent ? `${stats.timeSpent}h` : <span className='text-gray-500 dark:text-gray-500'>--</span>}</span>
            <span className="text-xs text-gray-600 dark:text-white/60">Time/mo</span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-48 h-32 z-10 flex items-center justify-center">
        {performance.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performance}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={40}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="score"
                label
              >
                {performance.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">No chart data</div>
        )}
        <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 mt-2">Category Accuracy</div>
      </div>
    </motion.div>
  );
} 