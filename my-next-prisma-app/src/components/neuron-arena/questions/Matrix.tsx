import React, { useState } from 'react';
import { useQuizStore } from '../state/quizStore';
import type { Question } from '../types/quiz.types';

const Matrix = ({ question }: { question: Question }) => {
  const rows = question.matrixOptions?.rows || [];
  const cols = question.matrixOptions?.cols || [];
  const [selected, setSelected] = useState<{ [rowId: string]: string }>({});
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleSelect(rowId: string, colId: string) {
    const next = { ...selected, [rowId]: colId };
    setSelected(next);
    setResponse({ questionId: question.id, response: next });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        {question.question}
      </div>
      <div className="bg-muted/60 rounded-xl p-6 shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th></th>
              {cols.map((col: any) => (
                <th key={col.id} className="text-center font-heading font-semibold text-base">{col.text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id}>
                <td className="font-medium pr-2">{row.text}</td>
                {cols.map((col: any) => (
                  <td key={col.id} className="text-center">
                    <input
                      type="radio"
                      name={row.id}
                      checked={selected[row.id] === col.id}
                      onChange={() => handleSelect(row.id, col.id)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Matrix; 