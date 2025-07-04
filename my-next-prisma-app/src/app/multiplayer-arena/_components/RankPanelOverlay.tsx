import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Clock, TrendingUp, PieChartIcon } from 'lucide-react';
import useSWR from 'swr';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface RankPanelOverlayProps {
  open: boolean;
  onClose: () => void;
  xp?: number;
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 border border-slate-200 dark:border-slate-700">
        <div className="text-purple-600 dark:text-purple-400">{icon}</div>
        <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const RankPanelOverlay = ({ open, onClose }: RankPanelOverlayProps) => {
  const { data, error, isLoading } = useSWR(open ? '/api/multiplayer-arena/history' : null, fetcher);
  const { data: rankHistoryData } = useSWR(open ? '/api/multiplayer-arena/rank-history' : null, fetcher);
  const xp = data?.xp || 0;
  const rankInfo = data?.rank || { name: '', emoji: '', description: '', xpMin: 0, xpMax: 0, colorScheme: ["#000", "#fff"] };
  const matchHistory = data?.history || [];
  const rankHistory = rankHistoryData?.history || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading rank panel...</div>;
  }
  if (error) {
    toast.error('Failed to load rank panel.');
    return <div className="flex items-center justify-center h-full text-red-500">Failed to load rank panel.</div>;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-[90vw] sm:max-w-none h-[90vh] bg-white dark:bg-[#16192a] rounded-2xl shadow-2xl flex flex-col p-0">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Summary Card */}
                <div className="flex items-center gap-4">
                  <span className="text-5xl" role="img" aria-label={rankInfo.name}>{rankInfo.emoji}</span>
                  <div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {rankInfo.name}
                      <span className="text-base text-slate-500 dark:text-slate-400">({xp.toLocaleString()} XP)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span>Next:</span>
                      {data?.nextRank ? (
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="text-lg">{data.nextRank.emoji}</span> {data.nextRank.name}
                        </span>
                      ) : (
                        <span className="font-semibold">Max Rank</span>
                      )}
                    </div>
                    <div className="w-48 mt-2">
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${data?.progressPercent || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="self-start md:self-auto absolute top-4 right-4 text-xl font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white">×</button>
              </div>
            </div>
            {/* Full Details/Tabs Below */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <TabsList className="mx-6 mt-4 bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none p-0">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">Match History</TabsTrigger>
                  <TabsTrigger value="rank-history">Rank History</TabsTrigger>
                  <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Left Column: Rank Info */}
                      <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Rank Details</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl" role="img" aria-label={rankInfo.name}>{rankInfo.emoji}</span>
                          <span className="font-bold text-lg" style={{color: rankInfo.colorScheme[0]}}>{rankInfo.name}</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{rankInfo.description}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>XP:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{xp.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Next:</span>
                          {data?.nextRank ? (
                            <span className="flex items-center gap-1 font-semibold">
                              <span className="text-lg">{data.nextRank.emoji}</span> {data.nextRank.name}
                            </span>
                          ) : (
                            <span className="font-semibold">Max Rank</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>To Next:</span>
                          {data?.nextRank ? (
                            <span className="font-bold text-green-600 dark:text-green-400">{(data.nextRank.xpMin - xp).toLocaleString()} XP</span>
                          ) : (
                            <span className="font-bold text-yellow-500 dark:text-yellow-400">--</span>
                          )}
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>{rankInfo.xpMin.toLocaleString()} XP</span>
                            <span>{rankInfo.xpMax === Infinity ? '∞' : rankInfo.xpMax.toLocaleString() + ' XP'}</span>
                          </div>
                          <div className="w-full">
                            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${data?.progressPercent || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Middle Column: Core Stats */}
                      <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Core Stats</h3>
                        <StatCard icon={<Clock size={24} />} label="Time Played" value={'--'} />
                        <StatCard icon={<TrendingUp size={24} />} label="Current Streak" value={'--'} />
                        <StatCard icon={<Brain size={24} />} label="IQ Score" value={'--'} />
                        <StatCard icon={<PieChartIcon size={24} />} label="Best Category" value={'--'} />
                      </div>
                      {/* Right Column: Visuals */}
                      <div className="md:col-span-2 lg:col-span-1 space-y-4 flex flex-col">
                        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Visualizations</h3>
                        <div className="bg-transparent dark:bg-slate-800/50 p-4 rounded-lg border border-transparent dark:border-slate-700 h-48 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-1">IQ Score Graph (Coming Soon)</div>
                        <div className="bg-transparent dark:bg-slate-800/50 p-4 rounded-lg border border-transparent dark:border-slate-700 h-48 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-1">Login Heatmap (Coming Soon)</div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="history">
                    <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">Recent Matches</h3>
                    <div className="space-y-3">
                      {matchHistory.length === 0 ? (
                        <div className="text-slate-400">No matches found.</div>
                      ) : (
                        matchHistory.map((match: any) => (
                          <div key={match.id} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{match.quizTitle}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(match.dateTaken).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-white">{match.earnedPoints} XP</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Score: {match.score}/{match.totalQuestions}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="rank-history">
                    <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-4">Rank History</h3>
                    <div className="space-y-3">
                      {rankHistory.length === 0 ? (
                        <div className="text-slate-400">No rank changes yet.</div>
                      ) : (
                        rankHistory.map((entry: any, idx: number) => (
                          <div key={entry.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-[#2a2040] dark:to-[#1a1a2a] rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl" role="img" aria-label="Old Rank">{entry.oldRankEmoji}</span>
                              <span className="font-semibold text-gray-700 dark:text-white">{entry.oldRankName}</span>
                              <span className="mx-2 text-purple-500 font-bold">→</span>
                              <span className="text-2xl" role="img" aria-label="New Rank">{entry.newRankEmoji}</span>
                              <span className="font-semibold text-purple-700 dark:text-purple-300">{entry.newRankName}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.changedAt).toLocaleString()}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.oldXp} XP → {entry.newXp} XP</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="performance">
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500 dark:text-slate-400">Detailed performance analytics coming soon.</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankPanelOverlay; 