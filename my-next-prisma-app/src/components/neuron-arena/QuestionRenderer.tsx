import React from 'react';
import { useQuizStore } from './state/quizStore';
import MCQSingle from './questions/MCQSingle';
import MCQMultiple from './questions/MCQMultiple';
import TrueFalse from './questions/TrueFalse';
import FillBlank from './questions/FillBlank';
import Ordering from './questions/Ordering';
import CodeOutput from './questions/CodeOutput';
import ImageBased from './questions/ImageBased';
import Matrix from './questions/Matrix';
import DragDrop from './questions/DragDrop';

const QuestionRenderer = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  if (!quiz) return null;
  const question = quiz.questions[currentIndex];
  if (!question) return <div>No question found.</div>;

  switch (question.type) {
    case 'mcq-single':
      return <MCQSingle question={question} />;
    case 'mcq-multiple':
      return <MCQMultiple question={question} />;
    case 'true-false':
      return <TrueFalse question={question} />;
    case 'fill-blanks':
      return <FillBlank question={question} />;
    case 'ordering':
      return <Ordering question={question} />;
    case 'code-output':
      return <CodeOutput question={question} />;
    case 'image-based':
      return <ImageBased question={question} />;
    case 'matrix':
      return <Matrix question={question} />;
    case 'drag-drop':
      return <DragDrop question={question} />;
    default:
      return <div>Unsupported question type: {question.type}</div>;
  }
};

export default QuestionRenderer; 