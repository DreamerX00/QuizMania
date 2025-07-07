import React from 'react';

const ImageBased = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[Image Based]</div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:ring-4 ring-[var(--primary-accent)] transition">
            <span className="text-2xl">🖼️</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageBased; 