import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

export const dynamic = "force-dynamic";
// NO cache - real-time game session

export async function GET() {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const setup = await prisma.gameSetup.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ setup });
}

const gameSetupSchema = z.object({
  mode: z.string().min(1).max(50),
  difficulty: z.string().min(1).max(50),
  region: z.string().min(1).max(50),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withValidation(gameSetupSchema, async (req: any) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { mode, difficulty, region } = req.validated;
  const setup = await prisma.gameSetup.create({
    data: { userId, mode, difficulty, region },
  });
  return NextResponse.json({ setup });
});
