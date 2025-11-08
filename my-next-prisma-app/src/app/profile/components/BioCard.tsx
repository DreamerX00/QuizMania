import React from 'react';
import { FaUserEdit } from 'react-icons/fa';

export function BioCard({ bio }: { bio: string }) {
  return (
    <div className="w-full max-w-xl mx-auto mt-4 rounded-2xl bg-white dark:bg-linear-to-br dark:from-[#23234d] dark:to-[#1a1a2e] shadow-xl border border-gray-200 dark:border-white/10 backdrop-blur-xl p-6 flex items-start gap-4 animate-fade-in">
      <div className="shrink-0 mt-1">
        <FaUserEdit className="text-blue-600 dark:text-blue-400 text-2xl" />
      </div>
      <div>
        <div className="text-xs text-gray-600 dark:text-white/60 font-semibold mb-1">Bio</div>
        <div className="text-base md:text-lg text-gray-800 dark:text-white/90 font-medium">
          {bio && bio !== 'Not set' ? bio : <span className="text-gray-500 dark:text-white/40 italic">No bio set yet. Click edit to add one!</span>}
        </div>
      </div>
    </div>
  );
} 
