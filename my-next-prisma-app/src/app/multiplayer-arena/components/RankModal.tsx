import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Clock, TrendingUp, PieChartIcon } from 'lucide-react';
import { getRankByXP } from '@/utils/rank';

// Dummy data for user stats
const matchHistory = [
    { id: 1, mode: 'MCQ', result: 'Victory', score: '+25 XP', date: '2h ago' },
    { id: 2, mode: 'True/False', result: 'Defeat', score: '-15 XP', date: '3h ago' },
    { id: 3, mode: 'Live Challenge', result: 'Victory', score: '+30 XP', date: '5h ago' },
    { id: 4, mode: 'Puzzle', result: 'Victory', score: '+20 XP', date: '1d ago' },
    { id: 5, mode: 'Essay', result: 'Defeat', score: '-10 XP', date: '1d ago' },
];

interface RankModalProps {
  isOpen: boolean;
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

const RankModal = ({ isOpen, onClose, xp }: RankModalProps) => {
  const userXP = typeof xp === 'number' ? xp : 685_000;
  const rankInfo = getRankByXP(userXP);
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-none h-[90vh] bg-white dark:bg-[#16192a] backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white flex flex-col p-0">
            <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <span className="text-4xl" role="img" aria-label={rankInfo.current.name}>{rankInfo.current.emoji}</span>
                    {rankInfo.current.name} <span className="text-base text-slate-500 dark:text-slate-400">({userXP.toLocaleString()} XP)</span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                    {rankInfo.current.description}
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="overview" className="h-full flex flex-col">
                    <TabsList className="mx-6 mt-4 bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none p-0">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-slate-500 dark:text-slate-400">Overview</TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-slate-500 dark:text-slate-400">Match History</TabsTrigger>
                        <TabsTrigger value="performance" className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800/50 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-slate-500 dark:text-slate-400">Performance Analytics</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-y-auto p-6">
                        <TabsContent value="overview">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Left Column: Rank Info */}
                                <div className="lg:col-span-1 space-y-4">
                                    <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Rank Details</h3>
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-3xl" role="img" aria-label={rankInfo.current.name}>{rankInfo.current.emoji}</span>
                                      <span className="font-bold text-lg" style={{color: rankInfo.current.colorScheme[0]}}>{rankInfo.current.name}</span>
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{rankInfo.current.description}</div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span>XP:</span>
                                      <span className="font-bold text-gray-900 dark:text-white">{userXP.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span>Next:</span>
                                      {rankInfo.next ? (
                                        <span className="flex items-center gap-1 font-semibold">
                                          <span className="text-lg">{rankInfo.next.emoji}</span> {rankInfo.next.name}
                                        </span>
                                      ) : (
                                        <span className="font-semibold">Max Rank</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span>To Next:</span>
                                      {rankInfo.next ? (
                                        <span className="font-bold text-green-600 dark:text-green-400">{(rankInfo.next.xpMin - userXP).toLocaleString()} XP</span>
                                      ) : (
                                        <span className="font-bold text-yellow-500 dark:text-yellow-400">--</span>
                                      )}
                                    </div>
                                    <div className="mt-4">
                                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                        <span>{rankInfo.current.xpMin.toLocaleString()} XP</span>
                                        <span>{rankInfo.current.xpMax === Infinity ? '∞' : rankInfo.current.xpMax.toLocaleString() + ' XP'}</span>
                                      </div>
                                      <div className="w-full">
                                        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                          <div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                            style={{ width: `${rankInfo.progressPercent}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                </div>
                                {/* Middle Column: Core Stats */}
                                <div className="lg:col-span-1 space-y-4">
                                     <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Core Stats</h3>
                                    <StatCard icon={<Clock size={24} />} label="Time Played" value={'128h 42m'} />
                                    <StatCard icon={<TrendingUp size={24} />} label="Current Streak" value={'W5'} />
                                    <StatCard icon={<Brain size={24} />} label="IQ Score" value={128} />
                                    <StatCard icon={<PieChartIcon size={24} />} label="Best Category" value={'Science'} />
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
                                {matchHistory.map(match => (
                                    <div key={match.id} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{match.mode}</p>
                                            <p className={`text-sm ${match.result === 'Victory' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{match.result}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">{match.score}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{match.date}</p>
                                        </div>
                                    </div>
                                ))}
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
            <DialogClose sound="close.mp3" />
        </DialogContent>
    </Dialog>
  );
};

export default RankModal; 