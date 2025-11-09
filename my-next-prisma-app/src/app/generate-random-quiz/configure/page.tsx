"use client";

// Configuration Wizard Page

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuizConfig } from "@/types/ai-quiz";
import {
  DIFFICULTY_LEVELS,
  POPULAR_SUBJECTS,
  GRADE_LEVELS,
} from "@/constants/ai-quiz";
import { getDifficultyTier } from "@/lib/ai-quiz/difficulty-mapper";

export default function ConfigureQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams?.get("provider") ?? null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Partial<QuizConfig>>({
    providerId: providerId || "openai-gpt4o-mini",
    subject: "",
    className: "",
    domain: "",
    topics: [],
    difficultyLevel: 4,
    difficultyTier: "INTERMEDIATE",
    questionCount: 10,
    timeLimit: undefined,
    allowSkip: true,
    showExplanations: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    customInstructions: "",
    focusAreas: [],
    excludeTopics: [],
    includeCode: false,
  });

  const [customTopic, setCustomTopic] = useState("");

  useEffect(() => {
    if (!providerId) {
      router.push("/generate-random-quiz");
    }
  }, [providerId, router]);

  const updateConfig = (updates: Partial<QuizConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const addTopic = () => {
    if (customTopic.trim() && !config.topics?.includes(customTopic.trim())) {
      updateConfig({
        topics: [...(config.topics || []), customTopic.trim()],
      });
      setCustomTopic("");
    }
  };

  const removeTopic = (topic: string) => {
    updateConfig({
      topics: (config.topics || []).filter((t) => t !== topic),
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate before sending
      if (!config.subject || !config.topics || config.topics.length === 0) {
        throw new Error("Please complete all required fields");
      }

      const response = await fetch("/api/ai-quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          difficultyTier: getDifficultyTier(config.difficultyLevel || 4),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.message || data.error || "Failed to generate quiz";
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data.data?.slug) {
        throw new Error("Invalid response from server");
      }

      // Redirect to preview page
      router.push(`/generate-random-quiz/preview/${data.data.slug}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate quiz";
      setError(errorMessage);
      alert(errorMessage); // Show alert for now, can replace with toast later
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return config.subject && config.subject.trim().length > 0;
    if (step === 2) return config.topics && config.topics.length > 0;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  };

  const difficultyConfig = DIFFICULTY_LEVELS.find(
    (d) => d.level === config.difficultyLevel
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 pt-20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s <= step
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      s < step
                        ? "bg-indigo-600"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Step {step} of 5
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Step 1: Subject & Domain */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Choose Subject & Domain
              </h2>

              <div className="space-y-6">
                {/* Popular Subjects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Popular Subjects
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {POPULAR_SUBJECTS.map((subj) => (
                      <button
                        key={subj.id}
                        onClick={() => updateConfig({ subject: subj.name })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          config.subject === subj.name
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                        }`}
                      >
                        <div className="text-3xl mb-2">{subj.icon}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {subj.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or Enter Custom Subject
                  </label>
                  <input
                    type="text"
                    value={config.subject || ""}
                    onChange={(e) => updateConfig({ subject: e.target.value })}
                    placeholder="e.g., Quantum Physics, Renaissance Art..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Grade Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade/Level (Optional)
                  </label>
                  <select
                    value={config.className || ""}
                    onChange={(e) =>
                      updateConfig({ className: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select grade level...</option>
                    {GRADE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specific Domain (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.domain || ""}
                    onChange={(e) => updateConfig({ domain: e.target.value })}
                    placeholder="e.g., Algebra, Classical Music, World War II..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Topics */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Select Topics
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add Topics (minimum 1)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTopic()}
                      placeholder="e.g., Quadratic Equations, Photosynthesis..."
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={addTopic}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Topics */}
                {config.topics && config.topics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected Topics ({config.topics.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {config.topics.map((topic) => (
                        <div
                          key={topic}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full"
                        >
                          <span>{topic}</span>
                          <button
                            onClick={() => removeTopic(topic)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Difficulty */}
          {step === 3 && difficultyConfig && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Choose Difficulty
              </h2>

              <div className="space-y-6">
                {/* Current Selection */}
                <div
                  className="p-6 rounded-xl text-center"
                  style={{
                    background: `linear-gradient(135deg, ${difficultyConfig.color}20, ${difficultyConfig.color}40)`,
                    borderLeft: `4px solid ${difficultyConfig.color}`,
                  }}
                >
                  <div className="text-6xl mb-3">{difficultyConfig.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {difficultyConfig.name} (Level {difficultyConfig.level})
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {difficultyConfig.description}
                  </p>
                  <div className="inline-flex items-center gap-4 text-sm">
                    <span className="font-semibold">
                      Base XP: {difficultyConfig.baseXP}
                    </span>
                    <span>•</span>
                    <span>
                      Pass Rate: {(difficultyConfig.passRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.difficultyLevel}
                    onChange={(e) =>
                      updateConfig({
                        difficultyLevel: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span>Easiest</span>
                    <span>Hardest</span>
                  </div>
                </div>

                {/* All Levels Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.level}
                      onClick={() =>
                        updateConfig({ difficultyLevel: level.level })
                      }
                      className={`p-2 rounded-lg border-2 text-center transition-all ${
                        config.difficultyLevel === level.level
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                      }`}
                    >
                      <div className="text-2xl mb-1">{level.emoji}</div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        L{level.level}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Settings */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Quiz Settings
              </h2>

              <div className="space-y-6">
                {/* Question Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Questions: {config.questionCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={config.questionCount}
                    onChange={(e) =>
                      updateConfig({ questionCount: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.timeLimit !== undefined}
                      onChange={(e) =>
                        updateConfig({
                          timeLimit: e.target.checked ? 1800 : undefined,
                        })
                      }
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Set Time Limit
                    </span>
                  </label>
                  {config.timeLimit !== undefined && (
                    <input
                      type="number"
                      value={config.timeLimit / 60}
                      onChange={(e) =>
                        updateConfig({
                          timeLimit: parseInt(e.target.value) * 60,
                        })
                      }
                      placeholder="Minutes"
                      className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                  )}
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  {[
                    {
                      key: "allowSkip",
                      label: "Allow Skipping Questions",
                      desc: "Users can skip and come back later",
                    },
                    {
                      key: "showExplanations",
                      label: "Show Explanations",
                      desc: "Display answers after completion",
                    },
                    {
                      key: "shuffleQuestions",
                      label: "Shuffle Questions",
                      desc: "Randomize question order",
                    },
                    {
                      key: "shuffleOptions",
                      label: "Shuffle Options",
                      desc: "Randomize answer choices",
                    },
                    {
                      key: "includeCode",
                      label: "Include Code Snippets",
                      desc: "For programming subjects",
                    },
                  ].map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {desc}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={config[key as keyof QuizConfig] as boolean}
                        onChange={(e) =>
                          updateConfig({ [key]: e.target.checked })
                        }
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>
                  ))}
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    value={config.customInstructions || ""}
                    onChange={(e) =>
                      updateConfig({ customInstructions: e.target.value })
                    }
                    placeholder="E.g., Focus on practical applications, include real-world examples..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(config.customInstructions || "").length}/500
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Review & Generate
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Subject & Topics
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>{config.subject}</strong>
                    {config.domain && ` • ${config.domain}`}
                    {config.className && ` • ${config.className}`}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {config.topics?.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Difficulty & Length
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {difficultyConfig?.emoji}{" "}
                    <strong>{difficultyConfig?.name}</strong> (Level{" "}
                    {config.difficultyLevel})
                    <br />
                    {config.questionCount} questions
                    {config.timeLimit &&
                      ` • ${config.timeLimit / 60} min time limit`}
                  </p>
                </div>

                <div className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Estimated XP
                      </h3>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {difficultyConfig?.baseXP} -{" "}
                        {difficultyConfig ? difficultyConfig.baseXP * 3 : 0} XP
                      </p>
                    </div>
                    <div className="text-5xl">{difficultyConfig?.emoji}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {step < 5 ? (
              <button
                onClick={() => canProceed() && setStep(step + 1)}
                disabled={!canProceed()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-8 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? "Generating..." : "🚀 Generate Quiz"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
