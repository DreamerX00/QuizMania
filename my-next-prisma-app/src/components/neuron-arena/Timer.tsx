'use client';

import React, { useEffect, useState } from 'react';
import { useQuizStore } from './state/quizStore';

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const Timer = () => {
  const startTime = useQuizStore((s) => s.startTime);
  const duration = useQuizStore((s) => s.duration);
  const submit = useQuizStore((s) => s.submit);
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(duration - elapsed, 0);
      setRemaining(left);
      if (left === 0) {
        clearInterval(interval);
        submit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, duration, submit]);

  // Warning color/animation when time is low
  const warning = remaining <= 30;

  return (
    <div
      className={`flex items-center gap-2 font-heading text-lg ${warning ? 'text-red-400 animate-pulse' : ''}`}
      aria-live="polite"
      title={warning ? 'Hurry up! Less than 30 seconds left.' : `Time remaining: ${formatTime(remaining)}`}
    >
      <span role="img" aria-label="timer">⏳</span>
      <span>{formatTime(remaining)}</span>
    </div>
  );
};

export default Timer; 
