import React from 'react';

const Timer = () => {
  return (
    <div className="flex items-center gap-2 font-heading text-lg">
      <span role="img" aria-label="timer">⏳</span>
      <span>00:00</span>
    </div>
  );
};

export default Timer; 