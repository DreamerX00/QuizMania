"use client";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-red-900 via-orange-900 to-red-900 px-4 py-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Error Image - Full Scale Responsive */}
        <div className="relative w-full aspect-4/3 max-w-2xl mb-8">
          <Image
            src="/Errors/500.png"
            alt="500 Server Error"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Error Details */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-600">
            500
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Something Went Wrong
          </h2>
          <p className="text-lg text-gray-300 max-w-xl">
            {error.message ||
              "An unexpected error occurred. Our team has been notified."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-red-500/50"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
