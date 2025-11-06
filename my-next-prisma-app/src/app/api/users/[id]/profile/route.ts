import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  socials?: string | null;
  region?: string | null;
  [key: string]: unknown;
}

function withNotSetFields(user: User) {
  return {
    ...user,
    name: user.name || "Not set",
    avatarUrl: user.avatarUrl || "Not set",
    bannerUrl: user.bannerUrl || "Not set",
    bio: user.bio || "Not set",
    alias: user.alias || "Not set",
    socials: user.socials || "Not set",
    region: user.region || "Not set",
  };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId || userId !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only select fields we actually need
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bannerUrl: true,
      bio: true,
      alias: true,
      socials: true,
      region: true,
      xp: true,
      rank: true,
      streak: true,
      points: true,
      accountType: true,
      premiumUntil: true,
      premiumSummary: {
        select: {
          templatesUsed: true,
          quizPacks: true,
          timeSaved: true,
          dollarValue: true,
        },
      },
    },
  });
  if (!user) {
    // Clerk removed - user must exist in database
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(withNotSetFields(user));
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  alias: z.string().max(50).optional(),
  socials: z.string().max(200).optional(),
  region: z.string().max(100).optional(),
});

interface ValidatedRequest extends Request {
  validated?: z.infer<typeof updateProfileSchema>;
}

export const PATCH = withValidation(
  updateProfileSchema,
  async (request: ValidatedRequest, context: RouteContext) => {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId || userId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const data = request.validated!;
      const updated = await prisma.user.update({
        where: { id: id },
        data: {
          name: data.name,
          avatarUrl: data.avatarUrl,
          bannerUrl: data.bannerUrl,
          bio: data.bio,
          alias: data.alias,
          socials: data.socials,
          region: data.region,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          bannerUrl: true,
          createdAt: true,
          role: true,
          xp: true,
          rank: true,
          streak: true,
          accountType: true,
          points: true,
          premiumUntil: true,
          bio: true,
          alias: true,
          socials: true,
          region: true,
          premiumSummary: true,
        },
      });
      return NextResponse.json(withNotSetFields(updated));
    } catch {
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }
  }
);
