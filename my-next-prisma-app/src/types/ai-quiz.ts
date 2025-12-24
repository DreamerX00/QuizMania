// AI Quiz Generation System Types

import {
  AIProviderType,
  AIQuizStatus,
  DifficultyTier,
} from "@/generated/prisma/client";

export interface QuizConfig {
  providerId: string;
  subject: string;
  className?: string;
  domain?: string;
  topics: string[];
  difficultyLevel: number;
  difficultyTier: DifficultyTier;
  questionCount: number;
  timeLimit?: number;
  allowSkip: boolean;
  showExplanations: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  customInstructions?: string;
  focusAreas?: string[];
  excludeTopics?: string[];
  includeCode?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  topic: string;
  estimatedTime: number;
  imageUrl?: string;
  codeSnippet?: string;
  points: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  estimatedTime: number;
  baseXP: number;
  maxXP: number;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    generationTime?: number;
    provider?: string;
  };
}

export interface GenerationProgress {
  step: "connecting" | "prompt" | "generating" | "validating" | "finalizing";
  progress: number;
  message: string;
  questionsGenerated?: number;
  tokensUsed?: number;
  timeElapsed?: number;
}

export interface ProviderCapabilities {
  maxTokens: number;
  maxQuestionsPerCall: number;
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsCode: boolean;
  supportedLanguages: string[];
}

export interface QuotaStatus {
  hasQuota: boolean;
  remaining: number;
  total: number;
  resetAt: Date;
  usage: {
    today: number;
    total: number;
  };
}

export interface XPCalculationParams {
  difficultyLevel: number;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpent: number;
  timeLimitSeconds?: number;
  longestStreak: number;
  perfectScore: boolean;
  bonusMultiplier: number;
}

export interface XPBreakdown {
  baseXP: number;
  accuracyBonus: number;
  speedBonus: number;
  streakBonus: number;
  perfectBonus: number;
  noWrongBonus: number;
  quickBonus: number;
  subtotal: number;
  bonusMultiplier: number;
  totalXP: number;
  breakdown: {
    accuracy: number;
    avgTimePerQuestion: number;
    longestStreak: number;
  };
}

export interface AttemptAnswer {
  questionId: string;
  selected: string | null;
  timeSpent: number;
  skipped: boolean;
  isCorrect?: boolean;
}

export interface AttemptResults {
  attemptId: string;
  score: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalTimeSpent: number;
  accuracy: number;
  streak: number;
  xpEarned: number;
  xpBreakdown: XPBreakdown;
  rankProgression?: {
    oldRank: string;
    newRank: string;
    rankedUp: boolean;
  };
}

export interface AIQuizFilters {
  subject?: string;
  difficultyLevel?: number;
  status?: AIQuizStatus;
  isPublic?: boolean;
  search?: string;
  sortBy?: "createdAt" | "attemptCount" | "averageScore";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AIQuizListItem {
  id: string;
  slug: string;
  title: string;
  subject: string;
  domain?: string;
  difficultyLevel: number;
  difficultyTier: DifficultyTier;
  questionCount: number;
  baseXP: number;
  status: AIQuizStatus;
  attemptCount: number;
  averageScore: number;
  createdAt: Date;
  provider: {
    name: string;
    model: string;
  };
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  apiKeyEnvVar: string;
  apiEndpoint: string;
  modelName: string;
  modelVersion?: string;
  capabilities: ProviderCapabilities;
  isActive: boolean;
  isRecommended: boolean;
}

export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  subject: string;
  className?: string;
  domain?: string;
  topics: string[];
  difficultyLevel: number;
  questionCount: number;
  timeLimit?: number;
  isPopular: boolean;
  isFeatured: boolean;
  usageCount: number;
}
