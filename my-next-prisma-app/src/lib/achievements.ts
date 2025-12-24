// import prisma from '@/lib/prisma';
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const achievements = {
  FIRST_QUIZ: {
    name: "First Steps",
    description: "You took your first quiz!",
    icon: "👟",
  },
  FIVE_QUIZZES: {
    name: "Getting Curious",
    description: "You took 5 quizzes.",
    icon: "🧐",
  },
  TEN_QUIZZES: {
    name: "Quiz Novice",
    description: "You took 10 quizzes!",
    icon: "🎓",
  },
  PERFECT_SCORE: {
    name: "Perfectionist",
    description: "You got a 100% score on a quiz.",
    icon: "🎯",
  },
  POLYGLOT: {
    name: "Polyglot",
    description: "You took quizzes in 3 different subjects.",
    icon: "🌍",
  },
  QUIZ_CREATOR: {
    name: "Creator",
    description: "You created your first quiz.",
    icon: "✍️",
  },
};

export type AchievementKey = keyof typeof achievements;

export async function seedAchievements() {
  console.log("Seeding achievements...");
  for (const key of Object.keys(achievements) as AchievementKey[]) {
    const achievement = achievements[key];
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: { description: achievement.description, icon: achievement.icon },
      create: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      },
    });
  }
  console.log("Achievements seeded.");
}

export async function checkAndAwardAchievement(
  userId: string,
  achievementKey: AchievementKey
) {
  const achievement = await prisma.achievement.findUnique({
    where: { name: achievements[achievementKey].name },
  });

  if (!achievement) {
    console.warn(`Achievement ${achievementKey} not found in DB.`);
    return;
  }

  const existingAward = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id,
      },
    },
  });

  if (!existingAward) {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    });
    console.log(`Awarded achievement ${achievement.name} to user ${userId}`);
    // Here you could add a notification for the user
  }
}
