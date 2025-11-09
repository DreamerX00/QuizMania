import { create } from 'zustand';
import type { Quiz, UserResponse } from '../types/quiz.types';

interface QuizState {
  quiz: Quiz | null;
  currentIndex: number;
  responses: UserResponse[];
  markedForReview: string[];
  startTime: number | null;
  duration: number;
  submitted: boolean;
  violations: { type: string; reason: string; timestamp: number }[];
  setQuiz: (quiz: Quiz) => void;
  setCurrentIndex: (idx: number) => void;
  setResponse: (response: UserResponse) => void;
  toggleMarkForReview: (questionId: string) => void;
  submit: () => void;
  reset: () => void;
  addViolation: (type: string, reason: string) => void;
  clearViolations: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quiz: null,
  currentIndex: 0,
  responses: [],
  markedForReview: [],
  startTime: null,
  duration: 0,
  submitted: false,
  violations: [],
  setQuiz: (quiz) => set({ quiz, duration: quiz.duration, startTime: Date.now(), submitted: false }),
  setCurrentIndex: (idx) => set({ currentIndex: idx }),
  setResponse: (response) => {
    set((state) => {
      const filtered = state.responses.filter(r => r.questionId !== response.questionId);
      return { responses: [...filtered, response] };
    });
  },
  toggleMarkForReview: (questionId) => {
    set((state) => {
      const marked = state.markedForReview.includes(questionId)
        ? state.markedForReview.filter(id => id !== questionId)
        : [...state.markedForReview, questionId];
      return { markedForReview: marked };
    });
  },
  submit: () => {
    set({ submitted: true });
    // Submission logic placeholder
  },
  reset: () => set({
    quiz: null,
    currentIndex: 0,
    responses: [],
    markedForReview: [],
    startTime: null,
    duration: 0,
    submitted: false,
    violations: [],
  }),
  addViolation: (type, reason) => {
    set((state) => ({
      violations: [...state.violations, { type, reason, timestamp: Date.now() }],
    }));
  },
  clearViolations: () => set({ violations: [] }),
})); 
