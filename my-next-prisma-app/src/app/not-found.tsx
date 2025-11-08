import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-gray-900 dark:to-gray-950 px-4 py-12">
      <h1 className="text-5xl font-bold text-[var(--primary-accent)] dark:text-purple-400 mb-2">404</h1>
      <h2 className="text-2xl font-semibold mt-2 text-gray-800 dark:text-gray-200 text-center">Lost in the Digital Wilderness</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 text-center max-w-xl">This page seems to have wandered off. Let’s find your way back!</p>
      <div className="mt-6 flex gap-4">
        <Link href="/search" className="futuristic-button scale-105 transition-transform duration-300 focus:ring-4 focus:ring-[var(--primary-accent)]" aria-label="Search Again">
          Search Again
        </Link>
        <Link href="/" className="futuristic-button bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 transition-transform duration-300 focus:ring-4 focus:ring-[var(--primary-accent)]" aria-label="Go Home">
          Go Home
        </Link>
      </div>
    </main>
  );
} 
