"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Users,
  Award,
  Flame,
  Zap,
  Target,
  Brain,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Sparkles,
  Globe,
  MapPin,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  Timer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { getRankByXP } from "@/utils/rank";
import { RANK_TIERS } from "@/constants/ranks";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatarUrl: string | null;
  points: number;
  xp?: number;
  accountType: string;
  totalQuizzes: number;
  streak?: number;
  region?: string;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

type FilterType = "all" | "global" | "region" | "friends";
type SortType = "points" | "xp" | "quizzes" | "streak";
type TimeRange = "today" | "week" | "month" | "allTime";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("points");
  const [timeRange, setTimeRange] = useState<TimeRange>("allTime");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, mutate } = useSWR<LeaderboardResponse>(
    `/api/leaderboard?page=${page}&limit=50&sort=${sortBy}&filter=${filterType}&time=${timeRange}`,
    fetcher,
    { refreshInterval: 30000 } // Auto-refresh every 30 seconds
  );

  const currentUserRank = useMemo(() => {
    if (!data?.leaderboard || !user?.id) return null;
    return data.leaderboard.find((u) => u.id === user.id);
  }, [data, user]);

  // Filter by search query
  const filteredLeaderboard = useMemo(() => {
    if (!data?.leaderboard) return [];
    if (!searchQuery.trim()) return data.leaderboard;

    const query = searchQuery.toLowerCase();
    return data.leaderboard.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.rank.toString().includes(query)
    );
  }, [data, searchQuery]);

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <Crown className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
          <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse" />
        </motion.div>
      );
    if (rank === 2)
      return (
        <motion.div whileHover={{ scale: 1.1 }}>
          <Medal className="w-7 h-7 text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.8)]" />
        </motion.div>
      );
    if (rank === 3)
      return (
        <motion.div whileHover={{ scale: 1.1 }}>
          <Medal className="w-7 h-7 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
        </motion.div>
      );
    if (rank <= 10)
      return (
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 flex items-center justify-center">
          <span className="text-base font-bold text-purple-600 dark:text-purple-400">
            #{rank}
          </span>
        </div>
      );
    return (
      <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
        #{rank}
      </span>
    );
  };

  const getRankColor = (rank: number) => {
    if (rank === 1)
      return "from-yellow-500/20 via-yellow-400/10 to-amber-500/20 border-yellow-500/40 shadow-yellow-500/20";
    if (rank === 2)
      return "from-gray-400/20 via-gray-300/10 to-slate-400/20 border-gray-400/40 shadow-gray-400/20";
    if (rank === 3)
      return "from-amber-600/20 via-amber-500/10 to-orange-500/20 border-amber-600/40 shadow-amber-600/20";
    if (rank <= 10)
      return "from-purple-500/10 via-blue-500/5 to-indigo-500/10 border-purple-500/30 shadow-purple-500/10";
    return "from-slate-500/5 to-slate-600/5 border-slate-300 dark:border-slate-700";
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "from-green-500 to-emerald-500";
    if (percent >= 50) return "from-blue-500 to-cyan-500";
    if (percent >= 25) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-linear-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white pt-20 pb-8 px-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-linear-to-br from-purple-500/30 to-blue-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 2 }}
          className="absolute top-1/3 -right-40 w-96 h-96 bg-linear-to-br from-pink-500/30 to-purple-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 left-1/4 w-80 h-80 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black bg-linear-to-r from-yellow-400 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl">
              Global Leaderboard
            </h1>
            <motion.div
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Crown className="w-10 h-10 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
            </motion.div>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-3">
            Compete with the world&apos;s finest quiz masters
          </p>

          {/* Real-time Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-4"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-purple-500/30 shadow-lg">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold">
                {data?.pagination.total || 0} Players
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-blue-500/30 shadow-lg">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold">Live Updates</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-green-500/30 shadow-lg">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-semibold">
                {RANK_TIERS.length} Ranks
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Current User Rank Spotlight */}
        {currentUserRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 bg-linear-to-r ${getRankColor(
              currentUserRank.rank
            )} border-2 rounded-2xl p-4 backdrop-blur-xl shadow-xl relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
              {/* Avatar with Rank Glow */}
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(168,85,247,0.5)",
                      "0 0 30px rgba(168,85,247,0.8)",
                      "0 0 15px rgba(168,85,247,0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full overflow-hidden border-3 border-purple-500/50"
                >
                  {currentUserRank.avatarUrl ? (
                    <Image
                      src={currentUserRank.avatarUrl}
                      alt={currentUserRank.name || "User"}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      {currentUserRank.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1.5 border-2 border-white dark:border-slate-900"
                >
                  <Star className="w-4 h-4 text-yellow-300" />
                </motion.div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {currentUserRank.name}
                  </h3>
                  {(currentUserRank.accountType === "PREMIUM" ||
                    currentUserRank.accountType === "LIFETIME") && (
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Rank{" "}
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        #{currentUserRank.rank}
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                        {currentUserRank.points.toLocaleString()}
                      </span>{" "}
                      Points
                    </span>
                  </div>
                  <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                        {currentUserRank.totalQuizzes}
                      </span>{" "}
                      Quizzes
                    </span>
                  </div>
                </div>

                {/* Rank Tier Info */}
                {currentUserRank.xp !== undefined && (
                  <div className="mt-3">
                    {(() => {
                      const rankInfo = getRankByXP(currentUserRank.xp);
                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {rankInfo.current.emoji}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {rankInfo.current.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {rankInfo.progressPercent.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${rankInfo.progressPercent}%`,
                                  }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full bg-linear-to-r ${getProgressColor(
                                    rankInfo.progressPercent
                                  )}`}
                                />
                              </div>
                              {rankInfo.next && (
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {currentUserRank.xp.toLocaleString()} /{" "}
                                    {rankInfo.current.xpMax.toLocaleString()} XP
                                  </span>
                                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                    Next: {rankInfo.next.emoji}{" "}
                                    {rankInfo.next.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-700 hover:border-purple-500 transition-all"
            >
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filters</span>
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-md ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-300 dark:border-slate-700 space-y-4"
              >
                {/* Filter Type */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Filter By
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", icon: Globe, label: "All Players" },
                      { value: "global", icon: Trophy, label: "Top Global" },
                      { value: "region", icon: MapPin, label: "My Region" },
                      { value: "friends", icon: Users, label: "Friends" },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setFilterType(value as FilterType)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                          filterType === value
                            ? "bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Sort By
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "points", icon: Sparkles, label: "Points" },
                      { value: "xp", icon: Zap, label: "XP" },
                      { value: "quizzes", icon: Brain, label: "Quizzes" },
                      { value: "streak", icon: Flame, label: "Streak" },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setSortBy(value as SortType)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                          sortBy === value
                            ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Range */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Time Period
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "today", icon: Clock, label: "Today" },
                      { value: "week", icon: Calendar, label: "This Week" },
                      { value: "month", icon: Calendar, label: "This Month" },
                      { value: "allTime", icon: Timer, label: "All Time" },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTimeRange(value as TimeRange)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                          timeRange === value
                            ? "bg-linear-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Leaderboard List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 backdrop-blur-xl overflow-hidden"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="w-16 h-16 text-purple-600 mb-4" />
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading champions...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <Award className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-semibold">
                Failed to load leaderboard
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please try again later
              </p>
              <button
                onClick={() => mutate()}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all"
              >
                Retry
              </button>
            </div>
          ) : !filteredLeaderboard || filteredLeaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <Users className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-semibold">No players found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {/* Top 3 Special Cards */}
              {filteredLeaderboard.slice(0, 3).map((player, index) => {
                const rankInfo =
                  player.xp !== undefined ? getRankByXP(player.xp) : null;
                const isExpanded = expandedUser === player.id;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-linear-to-r ${getRankColor(
                      player.rank
                    )} p-4 hover:shadow-xl transition-all cursor-pointer`}
                    onClick={() =>
                      setExpandedUser(isExpanded ? null : player.id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className="shrink-0">
                        {getRankBadge(player.rank)}
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-3 border-white/50 dark:border-slate-800/50 shadow-lg"
                        >
                          {player.avatarUrl ? (
                            <Image
                              src={player.avatarUrl}
                              alt={player.name || "User"}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                              {player.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                        </motion.div>
                        {rankInfo && (
                          <div className="absolute -bottom-0.5 -right-0.5 text-xl bg-white dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-800">
                            {rankInfo.current.emoji}
                          </div>
                        )}
                        {(player.accountType === "PREMIUM" ||
                          player.accountType === "LIFETIME") && (
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute -top-0.5 -right-0.5 bg-yellow-500 rounded-full p-0.5"
                          >
                            <Crown className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                            {player.name || "Anonymous"}
                          </h3>
                          {player.id === user?.id && (
                            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-semibold">
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              {player.points.toLocaleString()}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              points
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {player.totalQuizzes}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              quizzes
                            </span>
                          </div>
                          {player.streak !== undefined && player.streak > 0 && (
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-orange-500" />
                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                {player.streak}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                streak
                              </span>
                            </div>
                          )}
                        </div>

                        {rankInfo && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {rankInfo.current.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {rankInfo.progressPercent.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div
                                className={`h-full bg-linear-to-r ${getProgressColor(
                                  rankInfo.progressPercent
                                )}`}
                                style={{
                                  width: `${rankInfo.progressPercent}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="hidden lg:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-lg font-bold">
                            {player.xp !== undefined
                              ? player.xp.toLocaleString()
                              : "—"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          XP
                        </span>
                      </div>

                      {/* Expand Arrow */}
                      <button className="shrink-0 p-1.5 hover:bg-white/20 dark:hover:bg-black/20 rounded-full transition-all">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && rankInfo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/20 dark:border-black/20"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white/50 dark:bg-black/30 rounded-lg p-2 text-center">
                              <div className="text-xl mb-0.5">
                                {rankInfo.current.emoji}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Rank Tier
                              </div>
                              <div className="text-xs font-bold">
                                {rankInfo.current.name}
                              </div>
                            </div>
                            <div className="bg-white/50 dark:bg-black/30 rounded-lg p-2 text-center">
                              <Zap className="w-5 h-5 mx-auto mb-0.5 text-yellow-500" />
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Total XP
                              </div>
                              <div className="text-xs font-bold">
                                {player.xp?.toLocaleString() || 0}
                              </div>
                            </div>
                            <div className="bg-white/50 dark:bg-black/30 rounded-lg p-2 text-center">
                              <Target className="w-5 h-5 mx-auto mb-0.5 text-blue-500" />
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Next Rank
                              </div>
                              <div className="text-xs font-bold">
                                {rankInfo.next ? (
                                  <span>
                                    {rankInfo.next.emoji} {rankInfo.next.name}
                                  </span>
                                ) : (
                                  <span>MAX</span>
                                )}
                              </div>
                            </div>
                            <div className="bg-white/50 dark:bg-black/30 rounded-lg p-2 text-center">
                              <BarChart3 className="w-5 h-5 mx-auto mb-0.5 text-purple-500" />
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Progress
                              </div>
                              <div className="text-xs font-bold">
                                {rankInfo.progressPercent.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Rest of the Players */}
              {filteredLeaderboard.slice(3).map((player, index) => {
                const rankInfo =
                  player.xp !== undefined ? getRankByXP(player.xp) : null;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.05 }}
                    className={`flex items-center gap-4 p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all ${
                      player.id === user?.id
                        ? "bg-purple-50/50 dark:bg-purple-900/10"
                        : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-16 flex justify-center items-center shrink-0">
                      {getRankBadge(player.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-gray-300 dark:border-slate-600">
                        {player.avatarUrl ? (
                          <Image
                            src={player.avatarUrl}
                            alt={player.name || "User"}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base">
                            {player.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      {rankInfo && (
                        <div className="absolute -bottom-0.5 -right-0.5 text-base bg-white dark:bg-slate-800 rounded-full border border-white dark:border-slate-800">
                          {rankInfo.current.emoji}
                        </div>
                      )}
                      {(player.accountType === "PREMIUM" ||
                        player.accountType === "LIFETIME") && (
                        <div className="absolute -top-0.5 -right-0.5 bg-yellow-500 rounded-full p-0.5">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {player.name || "Anonymous"}
                        </p>
                        {player.id === user?.id && (
                          <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-semibold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          {player.points.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Brain className="w-3 h-3 text-blue-500" />
                          {player.totalQuizzes}
                        </span>
                        {player.streak !== undefined && player.streak > 0 && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {player.streak}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Points Display */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 justify-end">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {player.points.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        points
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {data && data.pagination.total > data.pagination.limit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mt-6"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 hover:shadow-lg transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
              Previous
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-bold shadow-lg">
              <Trophy className="w-4 h-4" />
              <span>Page {page}</span>
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasMore}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 hover:shadow-lg transition-all"
            >
              Next
              <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
            </button>
          </motion.div>
        )}

        {/* Rank Tiers Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-bold mb-4 text-center bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🏆 Rank Tiers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {RANK_TIERS.map((tier, index) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-linear-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700 text-center shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="text-3xl mb-1.5">{tier.emoji}</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                  {tier.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Tier {tier.tier}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  {tier.xpMin.toLocaleString()} -{" "}
                  {tier.xpMax === Infinity ? "∞" : tier.xpMax.toLocaleString()}{" "}
                  XP
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

