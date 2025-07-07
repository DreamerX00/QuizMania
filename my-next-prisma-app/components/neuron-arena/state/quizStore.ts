import { create } from 'zustand';
import type { Quiz, UserResponse } from '../types/quiz.types';

interface QuizState {
  quiz: Quiz | null;
  currentIndex: number;
  responses: UserResponse[];
  markedForReview: string[];
  startTime: number | null;
  duration: number;
  setQuiz: (quiz: Quiz) => void;
  setCurrentIndex: (idx: number) => void;
  setResponse: (response: UserResponse) => void;
  toggleMarkForReview: (questionId: string) => void;
  submit: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quiz: null,
  currentIndex: 0,
  responses: [],
  markedForReview: [],
  startTime: null,
  duration: 0,
  setQuiz: (quiz) => set({ quiz, duration: quiz.duration, startTime: Date.now() }),
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
    // Submission logic placeholder
  },
  reset: () => set({
    quiz: null,
    currentIndex: 0,
    responses: [],
    markedForReview: [],
    startTime: null,
    duration: 0,
  }),
})); 