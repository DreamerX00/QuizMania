import React from 'react';

export default function SsoCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-blue-900 dark:from-black dark:to-gray-900 p-2 sm:p-0">
      <div className="flex flex-col items-center space-y-6 p-8 bg-gray-900/80 rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" style={{ borderTopColor: '#7f9cf5' }} />
          <div className="absolute inset-2 rounded-full bg-linear-to-br from-blue-600 to-purple-600 opacity-80 blur-sm animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-blue-900" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center">Completing sign-in…</h2>
        <p className="text-gray-400 text-center max-w-xs">
          Please wait while we finish logging you in with your social account.<br />
          You will be redirected automatically.
        </p>
      </div>
    </div>
  );
} 
