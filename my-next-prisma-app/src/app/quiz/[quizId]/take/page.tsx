'use client';
import React, { useEffect } from 'react';
import QuizContainer from '@/components/neuron-arena/QuizContainer';
import QuestionRenderer from '@/components/neuron-arena/QuestionRenderer';
import { useStaticQuiz } from '@/hooks/useQuizData';
import { useQuizStore } from '@/components/neuron-arena/state/quizStore';

const QuizTakePage = () => {
  const { quiz, loading, error } = useStaticQuiz();
  const setQuiz = useQuizStore((s) => s.setQuiz);

  useEffect(() => {
    if (quiz) setQuiz(quiz);
  }, [quiz, setQuiz]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading quiz…</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  if (!quiz) return null;

  return (
    <QuizContainer>
      <QuestionRenderer />
    </QuizContainer>
  );
};

export default QuizTakePage;
