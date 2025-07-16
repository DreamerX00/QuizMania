import React from "react";
import { motion } from "framer-motion";
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';

export function CreatedQuizzes() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR(
    user ? `/api/users/${user.id}/profile` : null,
    url => fetch(url).then(res => res.json())
  );

  if (isLoading || !data) {
    return <div className="bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[180px] border border-gray-200 dark:border-white/10" />;
  }

  const quizzes = Array.isArray(data) ? data : [];

  return (
    <motion.div
      className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-pink-400/10 dark:from-yellow-400/20 dark:to-pink-400/20 rounded-full blur-2xl animate-float z-0" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '2s' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 z-10 relative">
        {quizzes.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-500 col-span-2 text-center py-8">No quizzes created yet.</div>
        ) : (
          quizzes.map((quiz: any, i: number) => (
            <motion.div
              key={quiz.id}
              className="bg-gradient-to-br from-yellow-100 to-pink-100 dark:from-yellow-900/60 dark:to-pink-900/40 rounded-xl p-3 flex flex-col gap-2 hover:scale-[1.02] transition shadow border border-gray-200 dark:border-white/10 backdrop-blur-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="font-semibold text-base md:text-lg truncate text-gray-900 dark:text-white">{quiz.name || 'Untitled Quiz'}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Users Taken: {quiz.usersTaken ?? <span className='text-gray-500 dark:text-gray-500'>Not calculated</span>}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Avg. Score: {quiz.averageScore ?? <span className='text-gray-500 dark:text-gray-500'>Not calculated</span>}</div>
              <div className="text-yellow-600 dark:text-yellow-400 text-xs md:text-sm">Rating: {quiz.rating ?? <span className='text-gray-500 dark:text-gray-500'>Not rated</span>} ⭐</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <a
                  href={quiz.slug ? `/quiz/${quiz.slug}/edit` : `/quiz/${quiz.id}/edit`}
                  className="futuristic-button px-3 py-1 text-xs font-semibold"
                  tabIndex={-1}
                >Edit</a>
                <button className="px-3 py-1 rounded-full bg-red-600/80 text-white hover:bg-red-700 transition text-xs font-semibold" tabIndex={-1}>Delete</button>
                <button className="px-3 py-1 rounded-full bg-green-600/80 text-white hover:bg-green-700 transition text-xs font-semibold" tabIndex={-1}>Promote</button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
} 