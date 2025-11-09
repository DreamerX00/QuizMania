import { DifficultyLevel } from '@prisma/client';

export interface PricingConfig {
  pricePerAttempt: number; // in ₹
  pointPerAttempt: number;
  requiresPremium: boolean;
}

export const PRICING_CONFIG: Record<DifficultyLevel, PricingConfig> = {
  // Always Free
  SUPER_EASY: {
    pricePerAttempt: 0,
    pointPerAttempt: 0,
    requiresPremium: false,
  },

  // Standard Categories
  EASY: {
    pricePerAttempt: 5,
    pointPerAttempt: 10,
    requiresPremium: false,
  },
  NORMAL: {
    pricePerAttempt: 10,
    pointPerAttempt: 15,
    requiresPremium: false,
  },
  MEDIUM: {
    pricePerAttempt: 10,
    pointPerAttempt: 15,
    requiresPremium: false,
  },
  HARD: {
    pricePerAttempt: 20,
    pointPerAttempt: 50,
    requiresPremium: false,
  },
  IMPOSSIBLE: {
    pricePerAttempt: 50,
    pointPerAttempt: 70,
    requiresPremium: false,
  },

  // Premium-Only Categories
  INSANE: {
    pricePerAttempt: 20,
    pointPerAttempt: 400,
    requiresPremium: true,
  },
  JEE_MAIN: {
    pricePerAttempt: 30,
    pointPerAttempt: 600,
    requiresPremium: true,
  },
  JEE_ADVANCED: {
    pricePerAttempt: 50,
    pointPerAttempt: 800,
    requiresPremium: true,
  },
  NEET_UG: {
    pricePerAttempt: 40,
    pointPerAttempt: 700,
    requiresPremium: true,
  },
  UPSC_CSE: {
    pricePerAttempt: 70,
    pointPerAttempt: 1000,
    requiresPremium: true,
  },
  GATE: {
    pricePerAttempt: 50,
    pointPerAttempt: 850,
    requiresPremium: true,
  },
  CAT: {
    pricePerAttempt: 60,
    pointPerAttempt: 750,
    requiresPremium: true,
  },
  CLAT: {
    pricePerAttempt: 40,
    pointPerAttempt: 600,
    requiresPremium: true,
  },
  CA: {
    pricePerAttempt: 30,
    pointPerAttempt: 500,
    requiresPremium: true,
  },
  GAOKAO: {
    pricePerAttempt: 80,
    pointPerAttempt: 1100,
    requiresPremium: true,
  },
  GRE: {
    pricePerAttempt: 60,
    pointPerAttempt: 800,
    requiresPremium: true,
  },
  GMAT: {
    pricePerAttempt: 65,
    pointPerAttempt: 900,
    requiresPremium: true,
  },
  USMLE: {
    pricePerAttempt: 75,
    pointPerAttempt: 950,
    requiresPremium: true,
  },
  LNAT: {
    pricePerAttempt: 50,
    pointPerAttempt: 800,
    requiresPremium: true,
  },
  MCAT: {
    pricePerAttempt: 70,
    pointPerAttempt: 900,
    requiresPremium: true,
  },
  CFA: {
    pricePerAttempt: 60,
    pointPerAttempt: 1000,
    requiresPremium: true,
  },
  GOD_LEVEL: {
    pricePerAttempt: 100,
    pointPerAttempt: 2000,
    requiresPremium: true,
  },
};

// Daily attempt limits
export const DAILY_ATTEMPT_LIMITS = {
  FREE: 3,
  PREMIUM: 10,
} as const;

// Premium subscription price
export const PREMIUM_SUBSCRIPTION_PRICE = 400; // ₹400/month

// Points calculation formula
export function calculateEarnedPoints(userScore: number, totalMarks: number, pointPerAttempt: number): number {
  return Math.floor((userScore / totalMarks) * pointPerAttempt);
}

// Get pricing config for a difficulty level
export function getPricingConfig(difficulty: DifficultyLevel): PricingConfig {
  return PRICING_CONFIG[difficulty];
}

// Check if user can access premium quiz
export function canAccessPremiumQuiz(userAccountType: string, userPremiumUntil?: Date | null): boolean {
  if (userAccountType === 'LIFETIME') return true;
  if (userAccountType === 'PREMIUM' && userPremiumUntil && userPremiumUntil > new Date()) return true;
  return false;
}

// Get daily attempt limit for user
export function getDailyAttemptLimit(userAccountType: string): number {
  return userAccountType === 'FREE' ? DAILY_ATTEMPT_LIMITS.FREE : DAILY_ATTEMPT_LIMITS.PREMIUM;
} 
