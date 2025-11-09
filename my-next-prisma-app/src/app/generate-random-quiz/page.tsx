"use client";

// AI Quiz Generation - Landing Page

import { useEffect, useState } from "react";
import Link from "next/link";
import { AI_PROVIDERS, DIFFICULTY_LEVELS } from "@/constants/ai-quiz";
import { QuotaStatus } from "@/types/ai-quiz";

export default function AIQuizGenerationPage() {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotaStatus();
  }, []);

  const fetchQuotaStatus = async () => {
    try {
      const response = await fetch("/api/ai-quiz/quota");
      const data = await response.json();
      if (data.success) {
        setQuotaStatus(data.data);
      }
    } catch (error) {
      console.error("Error fetching quota:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🤖 AI Quiz Generation
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">
            Create personalized quizzes powered by cutting-edge AI models
          </p>

          {/* Quota Display */}
          {!loading && quotaStatus && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Remaining Today
                  </p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {quotaStatus.remaining} / {quotaStatus.total}
                  </p>
                </div>
              </div>
              {quotaStatus.remaining < quotaStatus.total && (
                <div className="border-l border-gray-300 dark:border-gray-600 pl-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Resets in
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {new Date(quotaStatus.resetAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Providers Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Choose Your AI Provider
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_PROVIDERS.filter((p) => p.isActive).map((provider) => (
              <Link
                key={provider.id}
                href={`/generate-random-quiz/configure?provider=${provider.id}`}
                className="group relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500"
              >
                {provider.isRecommended && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                    ⭐ Recommended
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{provider.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                      {provider.model}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {provider.description}
                </p>

                <div className="space-y-2 mb-4">
                  {provider.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>⚡ ~{provider.avgTime}s</span>
                  <span>
                    📊 {(provider.successRate * 100).toFixed(0)}% accuracy
                  </span>
                </div>

                <div className="mt-4">
                  <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors group-hover:bg-linear-to-r group-hover:from-indigo-600 group-hover:to-purple-600">
                    Select Provider →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Difficulty Levels Info */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Difficulty Levels
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {DIFFICULTY_LEVELS.map((level) => (
              <div
                key={level.level}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center hover:scale-105 transition-transform"
                style={{ borderTop: `4px solid ${level.color}` }}
              >
                <div className="text-3xl mb-2">{level.emoji}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {level.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {level.description}
                </p>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {level.baseXP} XP
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Highlight */}
        <section className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900 rounded-xl">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Generate custom quizzes in under 30 seconds
              </p>
            </div>

            <div className="p-6 bg-linear-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900 rounded-xl">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Fully Customizable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose topics, difficulty, and question count
              </p>
            </div>

            <div className="p-6 bg-linear-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-green-900 rounded-xl">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Earn XP & Ranks
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Progress through 10 difficulty tiers
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
