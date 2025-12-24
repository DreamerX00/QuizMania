// Prisma Accelerate Cache Configuration
import prisma from "./prisma";

/**
 * Prisma Accelerate Cache Configuration
 *
 * Prisma Accelerate is enabled with cacheStrategy for read operations.
 * Requires: DATABASE_URL to be a Prisma Accelerate connection string
 * (e.g., prisma://accelerate.prisma-data.net/?api_key=...)
 *
 * Cache TTL Guidelines:
 * - Static content (about, guides): 3600s (1 hour)
 * - User profiles: 300s (5 minutes)
 * - Leaderboards: 60s (1 minute)
 * - Quiz listings: 180s (3 minutes)
 * - Real-time data: NO CACHE
 */

export const CACHE_STRATEGIES = {
  // Static content - long cache
  STATIC: { ttl: 3600, swr: 7200 }, // 1 hour, stale-while-revalidate 2 hours

  // Semi-static content - medium cache
  QUIZ_LIST: { ttl: 180, swr: 360 }, // 3 minutes
  TAGS: { ttl: 600, swr: 1200 }, // 10 minutes

  // User-specific content - short cache
  USER_PROFILE: { ttl: 300, swr: 600 }, // 5 minutes
  LEADERBOARD: { ttl: 60, swr: 120 }, // 1 minute

  // Frequently updated - very short or no cache
  REALTIME: { ttl: 10, swr: 20 }, // 10 seconds (for non-critical real-time)
  NO_CACHE: undefined, // No caching for live data
} as const;

/**
 * Cached Prisma Queries for Read-Only Operations
 * Use these for pages that don't need real-time updates
 */

// Quiz Listings (Explore Page)
export async function getCachedQuizzes(options: {
  skip?: number;
  take?: number;
  where?: object;
  orderBy?: object;
}) {
  return await prisma.quiz.findMany({
    ...options,
    cacheStrategy: CACHE_STRATEGIES.QUIZ_LIST,
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
      imageUrl: true,
      likeCount: true,
      usersTaken: true,
      createdAt: true,
      durationInSeconds: true,
      isLocked: true,
      difficultyLevel: true,
      pricePerAttempt: true,
      pointPerAttempt: true,
      slug: true,
      price: true,
      field: true,
      subject: true,
      creator: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
}

// User Profile (Profile Page)
export async function getCachedUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    cacheStrategy: CACHE_STRATEGIES.USER_PROFILE,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      xp: true,
      rank: true,
      streak: true,
      points: true,
      accountType: true,
      premiumUntil: true,
      bio: true,
      createdAt: true,
    },
  });
}

// User Statistics
export async function getCachedUserStats(userId: string) {
  const [totalAttempts, completedQuizzes, averageScore] = await Promise.all([
    prisma.aIQuizAttempt.count({
      where: { userId },
    }),
    prisma.aIQuizAttempt.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.aIQuizAttempt.aggregate({
      where: { userId, status: "COMPLETED" },
      _avg: { score: true },
    }),
  ]);

  return {
    totalAttempts,
    completedQuizzes,
    averageScore: averageScore._avg.score || 0,
  };
}

// Leaderboard (Leaderboard Page)
export async function getCachedLeaderboard(limit = 100) {
  return await prisma.user.findMany({
    take: limit,
    orderBy: { points: "desc" },
    cacheStrategy: CACHE_STRATEGIES.LEADERBOARD,
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      rank: true,
      xp: true,
    },
  });
}

// Popular Tags
export async function getCachedPopularTags(limit = 20) {
  const quizzes = await prisma.quiz.findMany({
    select: { tags: true },
    cacheStrategy: CACHE_STRATEGIES.TAGS,
  });

  const tagCounts = new Map<string, number>();
  quizzes.forEach((quiz: (typeof quizzes)[number]) => {
    quiz.tags.forEach((tag: string) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

// Quiz Details (for display, not submission)
export async function getCachedQuizDetails(quizId: string) {
  return await prisma.quiz.findUnique({
    where: { id: quizId },
    cacheStrategy: CACHE_STRATEGIES.QUIZ_LIST,
    include: {
      questions: true,
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

// User's Created Quizzes
export async function getCachedUserQuizzes(userId: string) {
  return await prisma.quiz.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    cacheStrategy: CACHE_STRATEGIES.USER_PROFILE,
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
      imageUrl: true,
      likeCount: true,
      usersTaken: true,
      createdAt: true,
      isLocked: true,
      price: true,
    },
  });
}

/**
 * NON-CACHED Queries for Real-Time/Transactional Operations
 * Use regular prisma for:
 * - Quiz submissions
 * - Payment processing
 * - Real-time multiplayer
 * - User mutations
 * - Session management
 */

// Example: Quiz submission (NO CACHE)
export async function submitQuizAttempt(data: {
  userId: string;
  quizId: string;
  answers: object[];
  score: number;
  totalQuestions: number;
}) {
  // No caching for write operations
  return await prisma.aIQuizAttempt.create({
    data: {
      ...data,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}

// Example: Get active quiz attempt (NO CACHE - real-time data)
export async function getActiveQuizAttempt(userId: string, quizId: string) {
  // No caching for in-progress attempts
  return await prisma.aIQuizAttempt.findFirst({
    where: {
      userId,
      quizId,
      status: "IN_PROGRESS",
    },
    include: {
      quiz: true,
    },
  });
}

// Example: Update user points (NO CACHE)
export async function updateUserPoints(userId: string, points: number) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      points: {
        increment: points,
      },
    },
  });
}

export { prisma };
