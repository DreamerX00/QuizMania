import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Error Image - Full Scale Responsive */}
        <div className="relative w-full aspect-4/3 max-w-2xl mb-8">
          <Image
            src="/Errors/404.png"
            alt="404 Not Found"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Error Details */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-600">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-300 max-w-xl">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-purple-500/50"
          >
            Go Home
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Explore Quizzes
          </Link>
        </div>
      </div>
    </main>
  );
}
