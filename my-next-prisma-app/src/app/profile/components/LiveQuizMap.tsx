import React from "react";
import { motion } from "framer-motion";

export function LiveQuizMap() {
  // Mock data for now - in real app this would come from API
  const liveQuizzes = [];

  return (
    <motion.div
      className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/30 dark:to-purple-400/20 rounded-full blur-2xl animate-float z-0" />
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-400/10 to-pink-400/10 dark:from-blue-400/20 dark:to-pink-400/20 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '2s' }} />
      <div className="w-full h-40 md:h-48 bg-blue-100 dark:bg-gradient-to-br dark:from-blue-800/80 dark:to-blue-600/80 rounded-xl flex items-center justify-center text-blue-700 dark:text-blue-200 text-lg border border-blue-300 dark:border-blue-400/10 shadow-inner z-10 relative">
        [MapBox Integration Placeholder]
      </div>
      <div className="text-xs text-blue-600 dark:text-blue-200/80 mt-2 z-10 relative text-center">Real-time map of quizzes active around the world will appear here.</div>
    </motion.div>
  );
} 