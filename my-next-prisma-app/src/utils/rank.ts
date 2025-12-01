import { RANK_TIERS, RankTier } from "../constants/ranks";

export interface RankProgress {
  current: RankTier;
  next: RankTier | null;
  tierIndex: number;
  xpInTier: number;
  xpForTier: number;
  progressPercent: number; // 0-100
}

export function getRankByXP(xp: number): RankProgress {
  const tierIndex = RANK_TIERS.findIndex(
    (tier) => xp >= tier.xpMin && xp <= tier.xpMax
  );
  const current = RANK_TIERS[tierIndex] || RANK_TIERS[RANK_TIERS.length - 1];
  const next = RANK_TIERS[tierIndex + 1] || null;

  if (!current) {
    // Fallback if no tier found - use first tier
    const fallbackTier: RankTier = RANK_TIERS[0] || {
      tier: 1,
      name: "Novice",
      emoji: "🌱",
      description: "Starting your journey",
      theme: "Minimal Starter",
      colorScheme: ["#7ecbff", "#f5faff"],
      cardUI: "Simple card",
      badgeConcept: "Basic badge",
      xpMin: 0,
      xpMax: 100,
    };
    return {
      current: fallbackTier,
      next: null,
      tierIndex: 0,
      xpInTier: 0,
      xpForTier: 100,
      progressPercent: 0,
    };
  }

  const xpInTier = xp - current.xpMin;
  const xpForTier =
    current.xpMax === Infinity ? 1 : current.xpMax - current.xpMin + 1;
  const progressPercent =
    current.xpMax === Infinity
      ? 100
      : Math.min(100, Math.max(0, (xpInTier / xpForTier) * 100));

  return {
    current,
    next,
    tierIndex,
    xpInTier,
    xpForTier,
    progressPercent,
  };
}
