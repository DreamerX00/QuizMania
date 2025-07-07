import React from 'react';
import type { Question } from '../types/quiz.types';

const ImageBased = ({ question }: { question: Question }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">{question.question}</div>
      {question.imageUrl && (
        <img src={question.imageUrl} alt="Question" className="rounded-xl w-full max-w-xs mx-auto object-cover aspect-square" />
      )}
      {/* Add options or input as needed */}
    </div>
  );
};

export default ImageBased; 