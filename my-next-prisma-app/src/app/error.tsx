'use client';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-500 via-yellow-400 to-purple-500 dark:from-gray-900 dark:to-gray-950 px-4 py-12">
      <h1 className="text-5xl font-bold text-[var(--primary-accent)] dark:text-purple-400 mb-2">500</h1>
      <h2 className="text-2xl font-semibold mt-4 text-gray-800 dark:text-gray-200 text-center">Something Went Wrong</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 text-center max-w-xl">An unexpected error occurred: {error.message}</p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={reset}
          className="futuristic-button scale-105 transition-transform duration-300 focus:ring-4 focus:ring-[var(--primary-accent)]"
          aria-label="Try again"
        >
          Try Again
        </button>
        <Link href="/" className="futuristic-button bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 transition-transform duration-300 focus:ring-4 focus:ring-[var(--primary-accent)]" aria-label="Go Home">
          Go Home
        </Link>
      </div>
    </main>
  );
} 