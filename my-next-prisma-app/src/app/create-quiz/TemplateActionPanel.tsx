"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz } from '@prisma/client';
import { motion } from 'framer-motion';
import { X, Edit, Trash2, Globe, Bookmark, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { KeyedMutator } from 'swr';
import Modal from '@/components/ui/Modal';

interface TemplateActionPanelProps {
  quiz: Quiz | null;
  onClose: () => void;
  onDialogClose: () => void;
  mutate: KeyedMutator<Quiz[]>;
}

const DIFFICULTY_LEVELS = [
  { value: 'SUPER_EASY', label: 'Super Easy', color: 'bg-green-500' },
  { value: 'EASY', label: 'Easy', color: 'bg-lime-500' },
  { value: 'NORMAL', label: 'Normal', color: 'bg-blue-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-600' },
  { value: 'HARD', label: 'Hard', color: 'bg-orange-500' },
  { value: 'IMPOSSIBLE', label: 'Impossible', color: 'bg-red-700' },
  { value: 'INSANE', label: 'Insane', color: 'bg-fuchsia-700' },
  { value: 'JEE_ADVANCED', label: 'JEE (Advanced)', color: 'bg-yellow-700' },
  { value: 'JEE_MAIN', label: 'JEE (Main)', color: 'bg-yellow-500' },
  { value: 'NEET_UG', label: 'NEET (UG)', color: 'bg-pink-500' },
  { value: 'UPSC_CSE', label: 'UPSC (CSE)', color: 'bg-gray-700' },
  { value: 'GATE', label: 'GATE', color: 'bg-cyan-700' },
  { value: 'CAT', label: 'CAT', color: 'bg-orange-700' },
  { value: 'CLAT', label: 'CLAT', color: 'bg-indigo-700' },
  { value: 'CA', label: 'CA', color: 'bg-amber-700' },
  { value: 'GAOKAO', label: 'GAOKAO', color: 'bg-red-500' },
  { value: 'GRE', label: 'GRE', color: 'bg-blue-700' },
  { value: 'GMAT', label: 'GMAT', color: 'bg-purple-700' },
  { value: 'USMLE', label: 'USMLE', color: 'bg-teal-700' },
  { value: 'LNAT', label: 'LNAT', color: 'bg-gray-500' },
  { value: 'MCAT', label: 'MCAT', color: 'bg-emerald-700' },
  { value: 'CFA', label: 'CFA', color: 'bg-green-700' },
  { value: 'GOD_LEVEL', label: 'GOD LEVEL', color: 'bg-black' },
];

export default function TemplateActionPanel({ quiz, onClose, onDialogClose, mutate }: TemplateActionPanelProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!quiz) {
    return (
      <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center text-white/60">
        <div className="text-lg font-bold mb-2">Select a template to view details</div>
        <p className="text-sm">Actions and a preview of your quiz will appear here.</p>
      </div>
    );
  }

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await axios.patch(`/api/quizzes/templates/${quiz.id}/publish`);
      toast.success('Quiz published successfully!');
      await mutate((currentQuizzes) => currentQuizzes?.filter(q => q.id !== quiz.id), false);
      onClose();
    } catch (error) {
      toast.error('Failed to publish quiz.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/quizzes/templates/${quiz.id}`);
      toast.success('Quiz deleted.');
      await mutate((currentQuizzes) => currentQuizzes?.filter(q => q.id !== quiz.id), false);
      onClose();
    } catch (error) {
      toast.error('Failed to delete quiz.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handlePin = async () => {
    setIsPinning(true);
    try {
      const { data: updatedQuiz } = await axios.patch(`/api/quizzes/templates/${quiz.id}/pin`);
      await mutate((currentQuizzes) => 
        currentQuizzes?.map(q => q.id === quiz.id ? updatedQuiz : q), 
        false
      );
      toast.success(updatedQuiz.isPinned ? 'Quiz pinned!' : 'Quiz unpinned!');
    } catch (error) {
      toast.error('Failed to update pin status.');
    } finally {
      setIsPinning(false);
    }
  };
  
  const handleEdit = () => {
    onDialogClose();
    router.push(`/create-quiz/guide?id=${quiz.id}`);
  };

  const getQuestionCount = () => {
    try {
      const content = JSON.parse(quiz.jsonContent as string);
      return content.questions?.length || 0;
    } catch (error) {
      return 0;
    }
  };

  return (
    <>
      <motion.div
        key={quiz.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full flex flex-col p-6 bg-black/20 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold futuristic-title">{quiz.title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Details Section */}
        <div className="space-y-4 text-sm">
            <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center">
                {quiz.imageUrl ? <img src={quiz.imageUrl} alt={quiz.title} className="object-cover rounded-lg w-full h-full"/> : <p className="text-white/40">No Image</p>}
            </div>
            <p className="text-white/70">{quiz.description || 'No description provided.'}</p>
            <div className="flex flex-wrap gap-2">
                {quiz.tags.map(tag => <span key={tag} className="bg-white/10 text-xs px-2 py-1 rounded-full">{tag}</span>)}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                <div className="bg-white/10 text-xs px-2 py-1 rounded-full">
                    <span className="font-semibold">Time Limit:</span> {((quiz as any).durationInSeconds ?? 0) === 0 ? 'Unlimited' : `${Math.floor(((quiz as any).durationInSeconds ?? 0)/60)} min${((quiz as any).durationInSeconds ?? 0)%60 ? ' ' + ((quiz as any).durationInSeconds ?? 0)%60 + ' sec' : ''}`}
                </div>
                <div className="bg-white/10 text-xs px-2 py-1 rounded-full">
                    <span className="font-semibold">Locked:</span> {(quiz as any).isLocked ? 'Yes' : 'No'}
                </div>
                {(quiz as any).difficultyLevel && (
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-semibold ${DIFFICULTY_LEVELS.find(d => d.value === (quiz as any).difficultyLevel)?.color || 'bg-slate-700'} text-white`}>
                        {DIFFICULTY_LEVELS.find(d => d.value === (quiz as any).difficultyLevel)?.label || (quiz as any).difficultyLevel}
                    </span>
                )}
            </div>
            <div className="border-t border-white/10 my-4" />
            <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold text-white/50 block">Price</span> ₹{quiz.price === 0 ? 'Free' : quiz.price}</div>
                <div><span className="font-semibold text-white/50 block">Questions</span> {getQuestionCount()}</div>
                <div><span className="font-semibold text-white/50 block">Created</span> {format(new Date(quiz.createdAt), 'dd MMM yyyy')}</div>
                <div><span className="font-semibold text-white/50 block">Updated</span> {format(new Date(quiz.updatedAt), 'dd MMM yyyy')}</div>
            </div>
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-3">
            <button onClick={handleEdit} className="futuristic-button w-full flex items-center justify-center gap-2"><Edit size={16} /> Edit</button>
            <button onClick={handlePublish} disabled={isPublishing} className="futuristic-button w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 disabled:opacity-50">
              {isPublishing ? <Loader2 className="animate-spin" size={16}/> : '🚀'} Publish
            </button>
            <div className="flex gap-3">
                <button onClick={handlePin} disabled={isPinning} className={`futuristic-button flex-1 flex items-center justify-center gap-2 disabled:opacity-50 ${quiz.isPinned ? 'bg-yellow-500/80 text-white' : 'bg-white/10'}`}>
                    {isPinning ? <Loader2 className="animate-spin" size={16}/> : <Bookmark size={16} />} {quiz.isPinned ? 'Pinned' : 'Pin'}
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting} className="futuristic-button flex-1 flex items-center justify-center gap-2 bg-red-800/50 text-red-300 hover:bg-red-800/80 disabled:opacity-50">
                  {isDeleting ? <Loader2 className="animate-spin" size={16}/> : '🗑️'} Delete
                </button>
            </div>
        </div>
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48}/>
            <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
            <p className="text-white/60 mb-6">This will permanently delete the quiz template. This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2 rounded-lg bg-white/20 hover:bg-white/30">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                    {isDeleting ? <Loader2 className="animate-spin" /> : 'Delete'}
                </button>
            </div>
        </div>
      </Modal>
    </>
  );
} 