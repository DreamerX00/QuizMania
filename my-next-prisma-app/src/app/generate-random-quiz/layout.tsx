// AI Quiz Generation - Premium Gate Layout

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AIQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/generate-random-quiz");
  }

  // Check if user is premium
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accountType: true },
  });

  const isPremium =
    user && ["PREMIUM", "PREMIUM_PLUS", "LIFETIME"].includes(user.accountType);

  if (!isPremium) {
    redirect("/premium?feature=ai-quiz-generation");
  }

  return <>{children}</>;
}
