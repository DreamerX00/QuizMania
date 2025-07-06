import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Clock, TrendingUp, PieChartIcon, Trophy, Crown, Target, X, Star, Zap, Flame } from 'lucide-react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface RankPanelOverlayProps {
  open: boolean;
  onClose: () => void;
  xp?: number;
}

const StatCard = ({ icon, label, value, color = "purple" }: { icon: React.ReactNode, label: string, value: string | number, color?: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 dark:border-slate-600/50 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300`}
  >
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500/10 to-${color}-600/10 border border-${color}-500/30 flex items-center justify-center`}>
      <div className={`text-${color}-600 dark:text-${color}-400`}>{icon}</div>
    </div>
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </motion.div>
);

const RankPanelOverlay = ({ open, onClose }: RankPanelOverlayProps) => {
  const { data, error, isLoading } = useSWR(open ? '/api/multiplayer-arena/history' : null, fetcher);
  const { data: rankHistoryData } = useSWR(open ? '/api/multiplayer-arena/rank-history' : null, fetcher);
  const xp = data?.xp || 0;
  const rankInfo = data?.rank || { name: '', emoji: '', description: '', xpMin: 0, xpMax: 0, colorScheme: ["#000", "#fff"] };
  const matchHistory = data?.history || [];
  const rankHistory = rankHistoryData?.history || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading rank data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    toast.error('Failed to load rank panel.');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <Flame className="w-8 h-8 mx-auto mb-3" />
          <p>Failed to load rank panel.</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>
            
            {/* Header */}
            <div className="relative z-10 p-6 pb-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Battle Rank
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      Your combat achievements and progression
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              
              {/* Rank Summary */}
              <div className="flex items-center gap-4 mt-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
                <span className="text-4xl sm:text-5xl" role="img" aria-label={rankInfo.name}>{rankInfo.emoji}</span>
                <div className="flex-1">
                  <div className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    {rankInfo.name}
                    <span className="text-sm sm:text-base text-slate-500 dark:text-slate-400">({xp.toLocaleString()} XP)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1 text-slate-600 dark:text-slate-400">
                    <span>Next:</span>
                    {data?.nextRank ? (
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="text-lg">{data.nextRank.emoji}</span> {data.nextRank.name}
                      </span>
                    ) : (
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">Max Rank Achieved!</span>
                    )}
                  </div>
                  <div className="w-full mt-2">
                    <div className="h-3 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${data?.progressPercent || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <TabsList className="mx-6 mt-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-1">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Battles
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rank-history" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Progression
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Left Column: Rank Info */}
                      <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                          <Crown className="w-5 h-5" />
                          Rank Details
                        </h3>
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl" role="img" aria-label={rankInfo.name}>{rankInfo.emoji}</span>
                            <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{rankInfo.name}</span>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">{rankInfo.description}</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Current XP:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{xp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">To Next Rank:</span>
                              {data?.nextRank ? (
                                <span className="font-bold text-green-600 dark:text-green-400">{(data.nextRank.xpMin - xp).toLocaleString()} XP</span>
                              ) : (
                                <span className="font-bold text-yellow-500 dark:text-yellow-400">--</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Middle Column: Core Stats */}
                      <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Core Stats
                        </h3>
                        <div className="space-y-3">
                          <StatCard icon={<Clock size={24} />} label="Time Played" value={'--'} color="blue" />
                          <StatCard icon={<TrendingUp size={24} />} label="Current Streak" value={'--'} color="green" />
                          <StatCard icon={<Brain size={24} />} label="IQ Score" value={'--'} color="purple" />
                          <StatCard icon={<PieChartIcon size={24} />} label="Best Category" value={'--'} color="orange" />
                        </div>
                      </div>
                      
                      {/* Right Column: Visuals */}
                      <div className="md:col-span-2 lg:col-span-1 space-y-4">
                        <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Visualizations
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 dark:border-slate-600/50 h-32 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            IQ Score Graph (Coming Soon)
                          </div>
                          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 dark:border-slate-600/50 h-32 flex items-center justify-center text-slate-500 dark:text-slate-400">
                            Battle Heatmap (Coming Soon)
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Battles
                    </h3>
                    <div className="space-y-3">
                      {matchHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                          <Target className="w-12 h-12 mb-3 opacity-50" />
                          <p className="text-lg font-semibold mb-2">No Battles Yet</p>
                          <p className="text-sm text-center">Start your journey by joining your first battle!</p>
                        </div>
                      ) : (
                        matchHistory.map((match: any, index: number) => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex justify-between items-center p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div>
                              <p className="font-bold text-slate-700 dark:text-slate-200">{match.quizTitle}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(match.dateTaken).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-700 dark:text-slate-200">{match.earnedPoints} XP</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Score: {match.score}/{match.totalQuestions}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="rank-history" className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Rank Progression
                    </h3>
                    <div className="space-y-3">
                      {rankHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                          <Trophy className="w-12 h-12 mb-3 opacity-50" />
                          <p className="text-lg font-semibold mb-2">No Rank Changes Yet</p>
                          <p className="text-sm text-center">Keep battling to climb the ranks!</p>
                        </div>
                      ) : (
                        rankHistory.map((entry: any, idx: number) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl" role="img" aria-label="Old Rank">{entry.oldRankEmoji}</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{entry.oldRankName}</span>
                              <span className="mx-2 text-purple-500 font-bold">→</span>
                              <span className="text-2xl" role="img" aria-label="New Rank">{entry.newRankEmoji}</span>
                              <span className="font-semibold text-purple-700 dark:text-purple-300">{entry.newRankName}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.changedAt).toLocaleString()}</p>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.oldXp} XP → {entry.newXp} XP</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4">
                    <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance Analytics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Performance Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Win Rate</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">--%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Average Score</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">--%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Best Streak</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">--</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Category Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Science</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">--%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">History</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">--%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Geography</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">--%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RankPanelOverlay; 