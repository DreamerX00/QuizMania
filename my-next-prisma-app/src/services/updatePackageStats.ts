import prisma from "@/lib/prisma";

/**
 * Updates stats for all packages containing a specific quiz
 * This should be called whenever a quiz's stats change (attempts, likes, ratings, etc.)
 */
export async function updatePackageStatsForQuiz(quizId: string) {
  try {
    // Find all packages containing this quiz
    const packages = await prisma.quizPackage.findMany({
      where: { quizIds: { has: quizId } },
    });

    for (const pkg of packages) {
      await updatePackageStats(pkg.id);
    }
  } catch (error) {
    console.error("Error updating package stats for quiz:", quizId, error);
  }
}

/**
 * Updates stats for a specific package
 * This aggregates stats from all quizzes in the package
 */
export async function updatePackageStats(packageId: string) {
  try {
    // Get the package
    const pkg = await prisma.quizPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      console.error("Package not found:", packageId);
      return;
    }

    // Get all quizzes in the package
    const quizzes = await prisma.quiz.findMany({
      where: { id: { in: pkg.quizIds } },
      select: {
        id: true,
        usersTaken: true,
        likeCount: true,
        rating: true,
        averageScore: true,
      },
    });

    if (quizzes.length === 0) {
      // No quizzes in package, reset stats
      await prisma.quizPackage.update({
        where: { id: packageId },
        data: {
          totalAttempts: 0,
          totalLikes: 0,
          earnings: 0,
          averageRating: 0,
          averageScore: 0,
        },
      });
      return;
    }

    // Calculate aggregated stats
    const totalAttempts = quizzes.reduce(
      (sum: number, quiz: (typeof quizzes)[number]) =>
        sum + (quiz.usersTaken || 0),
      0
    );
    const totalLikes = quizzes.reduce(
      (sum: number, quiz: (typeof quizzes)[number]) =>
        sum + (quiz.likeCount || 0),
      0
    );

    // Calculate averages (only for quizzes that have ratings/scores)
    const quizzesWithRating = quizzes.filter(
      (q: (typeof quizzes)[number]) => q.rating > 0
    );
    const quizzesWithScore = quizzes.filter(
      (q: (typeof quizzes)[number]) => q.averageScore > 0
    );

    const averageRating =
      quizzesWithRating.length > 0
        ? quizzesWithRating.reduce(
            (sum: number, q: (typeof quizzesWithRating)[number]) =>
              sum + q.rating,
            0
          ) / quizzesWithRating.length
        : 0;

    const averageScore =
      quizzesWithScore.length > 0
        ? quizzesWithScore.reduce(
            (sum: number, q: (typeof quizzesWithScore)[number]) =>
              sum + q.averageScore,
            0
          ) / quizzesWithScore.length
        : 0;

    // Calculate earnings (70% of package price per attempt for paid packages)
    const earnings =
      pkg.price > 0 ? Math.floor(((totalAttempts * pkg.price) / 100) * 0.7) : 0;

    // Update the package stats
    await prisma.quizPackage.update({
      where: { id: packageId },
      data: {
        totalAttempts,
        totalLikes,
        earnings,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      },
    });

    console.log(`Updated package stats for ${packageId}:`, {
      totalAttempts,
      totalLikes,
      earnings,
      averageRating,
      averageScore,
    });
  } catch (error) {
    console.error("Error updating package stats:", packageId, error);
  }
}

/**
 * Updates stats for all packages (useful for initial setup or bulk updates)
 */
export async function updateAllPackageStats() {
  try {
    const packages = await prisma.quizPackage.findMany({
      select: { id: true },
    });

    console.log(`Updating stats for ${packages.length} packages...`);

    for (const pkg of packages) {
      await updatePackageStats(pkg.id);
    }

    console.log("All package stats updated successfully");
  } catch (error) {
    console.error("Error updating all package stats:", error);
  }
}
