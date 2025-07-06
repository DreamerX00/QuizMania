import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckSquare, ListChecks, Puzzle, FileText, Image, Rows, MousePointerClick, HelpCircle, ListOrdered, BarChart3, Zap, Target, X, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const VOTE_TYPES = [
  { 
    type: 'MCQ (Single)', 
    xp: 5, 
    notes: 'Single choice questions', 
    icon: <CheckSquare className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30'
  },
  { 
    type: 'MCQ (Multiple)', 
    xp: 10, 
    notes: 'Multiple choice questions', 
    icon: <ListChecks className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30'
  },
  { 
    type: 'True/False', 
    xp: 3, 
    notes: 'Binary choice questions', 
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/30'
  },
  { 
    type: 'Match', 
    xp: 12, 
    notes: 'Matching pairs', 
    icon: <Puzzle className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-500/10 to-red-500/10',
    borderColor: 'border-orange-500/30'
  },
  { 
    type: 'Matrix', 
    xp: 15, 
    notes: 'Complex matrix questions', 
    icon: <Rows className="w-5 h-5" />,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'from-indigo-500/10 to-purple-500/10',
    borderColor: 'border-indigo-500/30'
  },
  { 
    type: 'Poll', 
    xp: 0, 
    notes: 'Community voting', 
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'from-gray-500/10 to-slate-500/10',
    borderColor: 'border-gray-500/30'
  },
  { 
    type: 'Fill Blanks', 
    xp: 8, 
    notes: 'Text completion', 
    icon: <FileText className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'from-yellow-500/10 to-orange-500/10',
    borderColor: 'border-yellow-500/30'
  },
  { 
    type: 'Drag & Drop', 
    xp: 10, 
    notes: 'Interactive ordering', 
    icon: <MousePointerClick className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'from-cyan-500/10 to-blue-500/10',
    borderColor: 'border-cyan-500/30'
  },
  { 
    type: 'Image Based', 
    xp: 12, 
    notes: 'Visual questions', 
    icon: <Image className="w-5 h-5" />,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-500/10 to-rose-500/10',
    borderColor: 'border-pink-500/30'
  },
  { 
    type: 'Ordering', 
    xp: 10, 
    notes: 'Sequence arrangement', 
    icon: <ListOrdered className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'border-emerald-500/30'
  },
];

interface VoteTypesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoteTypesDialog: React.FC<VoteTypesDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[90vw] !h-[85vh] !max-w-none !max-h-none p-0 bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 text-gray-900 dark:text-white flex flex-col rounded-3xl shadow-2xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>
        
        <DialogHeader className="relative z-10 p-6 pb-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Target className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Battle Formats
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                  Choose your preferred combat style and earn XP rewards
                </DialogDescription>
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
        </DialogHeader>
        
        <div className="relative z-10 p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {VOTE_TYPES.map((t, index) => (
              <motion.div
                key={t.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <div className={`rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border ${t.borderColor} p-4 sm:p-5 flex flex-col items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300 h-32 sm:h-36`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${t.bgColor} border ${t.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-3`}>
                    <div className={`text-white bg-gradient-to-br ${t.color} bg-clip-text text-transparent`}>
                      {t.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col items-center text-center flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-1 leading-tight">
                      {t.type}
                    </h3>
                    
                    {/* XP Display */}
                    <div className="flex items-center gap-1 mb-1">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {t.xp === 0 ? '—' : `+${t.xp} XP`}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                      {t.notes}
                    </p>
                  </div>
                </div>
                
                {/* Vote Button */}
                <Button 
                  size="sm" 
                  className={`w-full -mt-2 bg-gradient-to-r ${t.color} hover:opacity-90 text-white font-semibold border-none shadow-lg transition-all duration-300 group-hover:shadow-xl rounded-t-none rounded-b-2xl`}
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Vote
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 p-6 pt-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-700/50 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Higher XP = More challenging formats</span>
            </div>
            <Button 
              onClick={onClose} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteTypesDialog; 