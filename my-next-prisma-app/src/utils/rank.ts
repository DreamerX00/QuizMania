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
    // Fallback if no tier found
    const fallbackTier = RANK_TIERS[0] || {
      name: "Novice",
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
