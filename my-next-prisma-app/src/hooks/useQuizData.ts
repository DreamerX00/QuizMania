'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import type { Quiz } from '@/components/neuron-arena/types/quiz.types';

// Types
interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface CreateQuizData {
  title: string;
  description: string;
  questions: Omit<Question, 'id'>[];
}

// API functions
const fetchQuizzes = async (): Promise<Quiz[]> => {
  const response = await axios.get('/api/quizzes');
  return response.data;
};

const fetchQuizById = async (id: string): Promise<Quiz> => {
  const response = await axios.get(`/api/quizzes/${id}`);
  return response.data;
};

const createQuiz = async (data: CreateQuizData): Promise<Quiz> => {
  const response = await axios.post('/api/quizzes', data);
  return response.data;
};

const updateQuiz = async ({ id, data }: { id: string; data: Partial<CreateQuizData> }): Promise<Quiz> => {
  const response = await axios.put(`/api/quizzes/${id}`, data);
  return response.data;
};

const deleteQuiz = async (id: string): Promise<void> => {
  await axios.delete(`/api/quizzes/${id}`);
};

// Custom hooks
export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: fetchQuizzes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuizById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      // Invalidate and refetch quizzes list
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateQuiz,
    onSuccess: (data) => {
      // Update the specific quiz in cache
      queryClient.setQueryData(['quiz', data.id], data);
      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteQuiz,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['quiz', id] });
      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useStaticQuiz() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/user_resources/sample-quiz-100.json');
        if (!res.ok) throw new Error('Failed to load quiz');
        const data = await res.json();
        // Adapt structure if needed
        setQuiz({
          id: 'sample-quiz-100',
          title: 'Neuron Arena Sample Quiz',
          description: '',
          questions: data.questions,
          duration: 1800, // 30 min default
        });
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, []);

  return { quiz, loading, error };
} 