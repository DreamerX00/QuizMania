import React from 'react';
import QuizContainer from '@/components/neuron-arena/QuizContainer';
import QuestionRenderer from '@/components/neuron-arena/QuestionRenderer';

const QuizTakePage = () => {
  return (
    <QuizContainer>
      <QuestionRenderer />
    </QuizContainer>
  );
};

export default QuizTakePage;
