import React from "react";
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Crown, Zap, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function PremiumSummary() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR(
    user ? `/api/users/${user?.id}/profile` : null,
    url => fetch(url).then(res => res.json())
  );

  if (isLoading || !data) {
    return <div className="bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[180px] border border-gray-200 dark:border-white/10" />;
  }

  const isPremium = data.accountType === 'PREMIUM' || data.accountType === 'LIFETIME';
  const isPremiumActive = isPremium && (!data.premiumUntil || new Date(data.premiumUntil) > new Date());
  const premiumSummary = data.premiumSummary || {};

  return (
    <motion.div
      className="relative bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 -right-8 w-16 h-16 bg-linear-to-br from-yellow-400/10 to-pink-400/10 dark:from-yellow-400/30 dark:to-pink-400/20 rounded-full blur-2xl animate-float z-0" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-linear-to-br from-yellow-400/10 to-pink-400/10 dark:from-yellow-400/20 dark:to-pink-400/20 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '2s' }} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10 relative">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium Status</h3>
        </div>
        {!isPremiumActive && (
          <Link 
            href="/premium"
            className="text-xs bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            Upgrade
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-4 md:gap-6 z-10 relative">
        {/* Points */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-200 drop-shadow-glow flex items-center gap-1">
            <Zap className="w-5 h-5" />
            {data.points || 0}
          </span>
          <span className="text-xs text-yellow-700 dark:text-yellow-100/80">Total Points</span>
        </div>

        {/* Premium Status */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl font-bold text-pink-700 dark:text-pink-200 drop-shadow-glow">
            {isPremiumActive ? '✓' : '✗'}
          </span>
          <span className="text-xs text-yellow-700 dark:text-yellow-100/80">Premium</span>
        </div>

        {/* Templates Used */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-300 drop-shadow-glow">
            {premiumSummary.templatesUsed || 0}
          </span>
          <span className="text-xs text-yellow-700 dark:text-yellow-100/80">Templates</span>
        </div>

        {/* Quiz Packs */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl font-bold text-green-700 dark:text-green-200 drop-shadow-glow">
            {premiumSummary.quizPacks || 0}
          </span>
          <span className="text-xs text-yellow-700 dark:text-yellow-100/80">Quiz Packs</span>
        </div>

        {/* Time Saved */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-200 drop-shadow-glow">
            {premiumSummary.timeSaved ? `${premiumSummary.timeSaved}h` : '0h'}
          </span>
          <span className="text-xs text-yellow-700 dark:text-yellow-100/80">Time Saved</span>
        </div>

        {/* Dollar Value */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-2xl font-bold text-green-700 dark:text-green-200 drop-shadow-glow">
            ${premiumSummary.dollarValue ? premiumSummary.dollarValue.toFixed(0) : '0'}
          </span>
          <span className="text-xs text-yellow-700 dark:text-yellow-100/80">Value</span>
        </div>
      </div>

      {/* Premium Expiry Info */}
      {isPremiumActive && data.premiumUntil && (
        <div className="mt-4 p-3 bg-linear-to-r from-yellow-400/10 to-orange-500/10 rounded-lg border border-yellow-400/20">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-700 dark:text-yellow-300 font-medium">
              Premium active until {new Date(data.premiumUntil).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Upgrade CTA for non-premium users */}
      {!isPremiumActive && (
        <div className="mt-4 p-3 bg-linear-to-r from-blue-400/10 to-purple-500/10 rounded-lg border border-blue-400/20">
          <div className="text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              Unlock premium features and earn more points!
            </p>
            <Link 
              href="/premium"
              className="inline-flex items-center gap-2 bg-linear-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade to Premium
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
} 
