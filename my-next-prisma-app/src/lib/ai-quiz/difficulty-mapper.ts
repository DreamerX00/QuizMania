// Difficulty Level to Tier Mapper

import { DifficultyTier } from "@prisma/client";
import { DIFFICULTY_LEVELS } from "@/constants/ai-quiz";

export function getDifficultyTier(level: number): DifficultyTier {
  const difficulty = DIFFICULTY_LEVELS.find((d) => d.level === level);

  if (!difficulty) {
    throw new Error(`Invalid difficulty level: ${level}`);
  }

  return difficulty.tier as DifficultyTier;
}

export function getDifficultyConfig(level: number) {
  const difficulty = DIFFICULTY_LEVELS.find((d) => d.level === level);

  if (!difficulty) {
    throw new Error(`Invalid difficulty level: ${level}`);
  }

  return difficulty;
}

export function getDifficultyByTier(tier: DifficultyTier) {
  const difficulty = DIFFICULTY_LEVELS.find((d) => d.tier === tier);

  if (!difficulty) {
    throw new Error(`Invalid difficulty tier: ${tier}`);
  }

  return difficulty;
}

export function getBaselineXP(level: number, questionCount: number): number {
  const difficulty = getDifficultyConfig(level);
  return Math.round(difficulty.baseXP * (questionCount / 10));
}

export function getMaxPossibleXP(level: number, questionCount: number): number {
  const baseXP = getBaselineXP(level, questionCount);
  // Maximum includes: base + accuracy (100%) + speed (30%) + streak (50%) + perfect (25%) + no wrong (15%) + quick (10%)
  // With 1.0 multiplier: base * 3.3
  return Math.round(baseXP * 3.3);
}

export function getDifficultyColor(level: number): string {
  const difficulty = getDifficultyConfig(level);
  return difficulty.color;
}

export function getDifficultyEmoji(level: number): string {
  const difficulty = getDifficultyConfig(level);
  return difficulty.emoji;
}

export function formatDifficultyLevel(level: number): string {
  const difficulty = getDifficultyConfig(level);
  return `${difficulty.emoji} ${difficulty.name} (Level ${level})`;
}
