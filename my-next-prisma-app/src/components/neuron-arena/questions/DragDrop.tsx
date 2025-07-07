import React from 'react';
import type { Question } from '../types/quiz.types';

const DragDrop = ({ question }: { question: Question }) => {
  const items = question.draggableItems || [];
  const zones = question.dropZones || [];
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">{question.question}</div>
      <div className="flex gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="rounded-lg bg-white/10 px-4 py-2 shadow cursor-grab">{item.text}</div>
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        {zones.map((zone: any) => (
          <div key={zone.id} className="rounded-lg bg-white/5 border-2 border-dashed border-[var(--primary-accent)] w-24 h-16 flex items-center justify-center">{zone.text}</div>
        ))}
      </div>
    </div>
  );
};

export default DragDrop; 