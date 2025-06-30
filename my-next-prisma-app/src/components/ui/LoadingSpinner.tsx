"use client";
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Roller Spinner */}
        <svg
          className="animate-spin-futuristic w-24 h-24 text-blue-400 drop-shadow-lg"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#38bdf8"
            strokeWidth="8"
            strokeDasharray="62.8 62.8"
            strokeLinecap="round"
            className="opacity-60"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#fff"
            strokeWidth="4"
            strokeDasharray="31.4 94.2"
            strokeLinecap="round"
            className="animate-spin-futuristic-inner"
          />
        </svg>
        {/* Sparkle Boom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="sparkle-boom" />
        </div>
        <span className="mt-8 text-lg text-blue-200 font-bold tracking-widest animate-pulse">Loading...</span>
      </div>
      <style jsx global>{`
        @keyframes spin-futuristic {
          0% { transform: rotate(0deg); }
          80% { transform: rotate(1080deg); }
          100% { transform: rotate(1440deg); }
        }
        .animate-spin-futuristic {
          animation: spin-futuristic 1.2s cubic-bezier(0.7,0.2,0.2,1) infinite;
        }
        @keyframes spin-futuristic-inner {
          0% { stroke-dashoffset: 0; }
          80% { stroke-dashoffset: 62.8; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-spin-futuristic-inner {
          animation: spin-futuristic-inner 1.2s cubic-bezier(0.7,0.2,0.2,1) infinite;
        }
        @keyframes sparkle-boom {
          0%, 80% { opacity: 0; transform: scale(0.5); }
          85% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(2); }
        }
        .sparkle-boom {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, #38bdf8 40%, transparent 80%);
          opacity: 0;
          pointer-events: none;
          animation: sparkle-boom 1.2s cubic-bezier(0.7,0.2,0.2,1) infinite;
          filter: blur(2px) brightness(1.5);
        }
      `}</style>
    </div>
  );
} 