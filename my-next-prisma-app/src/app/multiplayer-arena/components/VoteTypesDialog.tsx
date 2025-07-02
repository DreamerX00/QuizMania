import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckSquare, ListChecks, Puzzle, FileText, Image, Rows, MousePointerClick, HelpCircle, ListOrdered, BarChart3 } from 'lucide-react';

const VOTE_TYPES = [
  { type: 'MCQ (Single)', xp: 5, notes: '', icon: <CheckSquare size={14} className="text-lime-400" /> },
  { type: 'MCQ (Multiple)', xp: 10, notes: '', icon: <ListChecks size={14} className="text-lime-400" /> },
  { type: 'True/False', xp: 3, notes: '', icon: <HelpCircle size={14} className="text-blue-400" /> },
  { type: 'Match', xp: 12, notes: '', icon: <Puzzle size={14} className="text-purple-400" /> },
  { type: 'Matrix', xp: 15, notes: '', icon: <Rows size={14} className="text-pink-400" /> },
  { type: 'Poll', xp: 0, notes: '', icon: <BarChart3 size={14} className="text-gray-400" /> },
  { type: 'Fill Blanks', xp: 8, notes: '', icon: <FileText size={14} className="text-yellow-400" /> },
  { type: 'Drag & Drop', xp: 10, notes: '', icon: <MousePointerClick size={14} className="text-cyan-400" /> },
  { type: 'Image Based', xp: 12, notes: '', icon: <Image size={14} className="text-pink-300" /> },
  { type: 'Ordering', xp: 10, notes: '', icon: <ListOrdered size={14} className="text-indigo-400" /> },
];

interface VoteTypesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoteTypesDialog: React.FC<VoteTypesDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[80vw] !h-[80vh] !max-w-none !max-h-none p-2 bg-white dark:bg-[#16192a] backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">All Match Types</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">XP values and rules for each type</DialogDescription>
        </DialogHeader>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))] gap-x-6 gap-y-4 mt-4 flex-1 overflow-y-auto">
          {VOTE_TYPES.map((t) => (
            <div key={t.type} className="flex flex-col items-center">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-3 flex flex-col items-center justify-between shadow-lg hover:scale-105 transition-transform w-[125px] h-[125px] min-w-[120px] min-h-[120px]">
                <div className="flex flex-col items-center pt-2 pb-2 w-full flex-1 justify-center">
                  <div className="mb-1">{t.icon}</div>
                  <div className="font-bold text-base text-gray-900 dark:text-white mb-0.5 text-center">{t.type}</div>
                  <div className="text-lime-600 dark:text-lime-300 font-semibold mb-0.5">{t.xp === 0 ? '—' : `+${t.xp} XP`}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-300 text-center">{t.notes}</div>
                </div>
              </div>
              <Button size="sm" sound="vote.mp3" className="w-full -mt-2 bg-lime-500 hover:bg-lime-600 text-black font-bold rounded-t-none rounded-b-xl shadow-lg">Vote</Button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} sound="close.mp3" className="bg-purple-600 hover:bg-purple-700 text-white">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteTypesDialog; 