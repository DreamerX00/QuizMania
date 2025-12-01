import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";

export function Achievements() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR(
    user ? `/api/users/${user?.id}/profile` : null,
    (url) => fetch(url).then((res) => res.json())
  );

  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[180px] border border-gray-200 dark:border-white/10" />
    );
  }

  const achievements = data.achievements || [];

  return (
    <motion.div
      className="relative bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 -right-8 w-16 h-16 bg-linear-to-br from-yellow-400/10 to-yellow-600/10 dark:from-yellow-400/20 dark:to-yellow-600/30 rounded-full blur-2xl animate-float z-0" />
      <div
        className="absolute bottom-0 left-0 w-12 h-12 bg-linear-to-br from-purple-400/10 to-blue-400/10 dark:from-purple-400/20 dark:to-blue-400/20 rounded-full blur-2xl animate-float z-0"
        style={{ animationDelay: "2s" }}
      />
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 z-10 relative">
        {achievements.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-500 col-span-4 text-center py-8">
            No achievements unlocked yet.
          </div>
        ) : (
          achievements.map((ach: any, _i: number) => (
            <motion.div
              key={ach.id}
              className={`flex flex-col items-center p-2 md:p-3 rounded-xl shadow-lg relative transition-all duration-300 ${
                ach.isLocked
                  ? "bg-gray-200 dark:bg-gray-800/80 blur-[2px]"
                  : "bg-linear-to-br from-yellow-400/20 to-yellow-600/20 dark:from-yellow-400/20 dark:to-yellow-600/30 border border-yellow-400/20 animate-glow"
              }`}
              whileHover={!ach.isLocked ? { scale: 1.08, rotate: 2 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
              style={{ minHeight: 80 }}
            >
              <span
                className={`text-2xl md:text-3xl mb-1 ${
                  !ach.isLocked ? "animate-pulse" : "opacity-40"
                }`}
              >
                {ach.icon || "🏆"}
              </span>
              <span
                className={`font-semibold text-xs md:text-sm text-center ${
                  !ach.isLocked
                    ? "text-yellow-700 dark:text-yellow-200"
                    : "text-gray-500 dark:text-gray-500"
                }`}
              >
                {ach.name}
              </span>
              {ach.isLocked && (
                <span className="absolute inset-0 bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-900 opacity-60 rounded-xl animate-pulse" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
