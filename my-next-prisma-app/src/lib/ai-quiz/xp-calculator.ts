// XP Calculation for AI Quiz Attempts

import { XPCalculationParams, XPBreakdown } from "@/types/ai-quiz";
import { DIFFICULTY_LEVELS } from "@/constants/ai-quiz";

export function calculateAIQuizXP(params: XPCalculationParams): XPBreakdown {
  // Base XP per difficulty level
  const difficultyConfig = DIFFICULTY_LEVELS.find(
    (d) => d.level === params.difficultyLevel
  );

  if (!difficultyConfig) {
    throw new Error(`Invalid difficulty level: ${params.difficultyLevel}`);
  }

  const baseXPPerQuestion = difficultyConfig.baseXP;
  const baseXP = Math.round(baseXPPerQuestion * (params.questionCount / 10));

  // 1. Accuracy Bonus (0-100% of base)
  const accuracy = params.correctCount / params.questionCount;
  const accuracyBonus = Math.round(baseXP * accuracy);

  // 2. Speed Bonus (up to 30% of base)
  let speedBonus = 0;
  if (params.timeLimitSeconds) {
    const timeRatio = params.timeSpent / params.timeLimitSeconds;
    // Bonus if completed in less than 75% of time
    if (timeRatio < 0.75) {
      const speedFactor = 1 - timeRatio;
      speedBonus = Math.round(baseXP * 0.3 * speedFactor);
    }
  }

  // 3. Streak Bonus (5+ correct in a row)
  let streakBonus = 0;
  if (params.longestStreak >= 5) {
    const streakMultiplier = Math.min(params.longestStreak / 10, 0.5);
    streakBonus = Math.round(baseXP * streakMultiplier);
  }

  // 4. Perfect Score Bonus (25% of base)
  const perfectBonus = params.perfectScore ? Math.round(baseXP * 0.25) : 0;

  // 5. No Wrong Answer Bonus (if all answered are correct)
  const noWrongBonus =
    params.wrongCount === 0 && params.correctCount > 0
      ? Math.round(baseXP * 0.15)
      : 0;

  // 6. Quick Answer Bonus (average < 30s per question)
  const avgTimePerQ = params.timeSpent / params.questionCount;
  const quickBonus = avgTimePerQ < 30 ? Math.round(baseXP * 0.1) : 0;

  // Calculate total before multiplier
  const subtotal = Math.round(
    baseXP +
      accuracyBonus +
      speedBonus +
      streakBonus +
      perfectBonus +
      noWrongBonus +
      quickBonus
  );

  // Apply bonus multiplier from quiz config
  const totalXP = Math.round(subtotal * params.bonusMultiplier);

  return {
    baseXP,
    accuracyBonus,
    speedBonus,
    streakBonus,
    perfectBonus,
    noWrongBonus,
    quickBonus,
    subtotal,
    bonusMultiplier: params.bonusMultiplier,
    totalXP,
    breakdown: {
      accuracy: accuracy * 100,
      avgTimePerQuestion: avgTimePerQ,
      longestStreak: params.longestStreak,
    },
  };
}

export function calculateLongestStreak(
  answers: Array<{ isCorrect: boolean }>
): number {
  let currentStreak = 0;
  let longestStreak = 0;

  for (const answer of answers) {
    if (answer.isCorrect) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

export function calculatePerformanceGrade(percentage: number): {
  grade: string;
  color: string;
  message: string;
} {
  if (percentage === 100) {
    return {
      grade: "S",
      color: "#FFD700",
      message: "Perfect! Absolutely flawless!",
    };
  } else if (percentage >= 90) {
    return { grade: "A", color: "#10B981", message: "Excellent work!" };
  } else if (percentage >= 80) {
    return { grade: "B", color: "#3B82F6", message: "Great job!" };
  } else if (percentage >= 70) {
    return { grade: "C", color: "#F59E0B", message: "Good effort!" };
  } else if (percentage >= 60) {
    return { grade: "D", color: "#EF4444", message: "Keep practicing!" };
  } else {
    return { grade: "F", color: "#991B1B", message: "Need more preparation." };
  }
}

export function getRecommendedNextDifficulty(
  currentLevel: number,
  accuracy: number
): number {
  // If scored 85% or higher, suggest next level
  if (accuracy >= 0.85 && currentLevel < 10) {
    return currentLevel + 1;
  }
  // If scored below 60%, suggest staying at same level or going down
  else if (accuracy < 0.6 && currentLevel > 1) {
    return currentLevel - 1;
  }
  // Otherwise, suggest same level
  return currentLevel;
}
