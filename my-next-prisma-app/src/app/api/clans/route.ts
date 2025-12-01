import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

// GET: List all clans, or clans the user is a member of

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const region = searchParams.get("region") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  const where: Record<string, unknown> = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { motto: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(region && region !== "All" ? { region } : {}),
  };
  const [clans, total] = await Promise.all([
    prisma.clan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        memberships: true,
        joinRequests: true,
      },
    }),
    prisma.clan.count({ where }),
  ]);
  // Map to detailed info
  const result = clans.map((clan) => {
    const memberCount = clan.memberships.length;
    const isOpen = true; // TODO: add open/approval logic
    let isMember = false,
      hasRequested = false;
    if (userId) {
      isMember = clan.memberships.some((m) => m.id === userId);
      hasRequested = clan.joinRequests.some(
        (r) => r.id === userId && r.status === "PENDING"
      );
    }
    return {
      id: clan.id,
      name: clan.name,
      motto: clan.motto,
      region: clan.region,
      emblemUrl: clan.emblemUrl,
      memberCount,
      isOpen,
      isMember,
      hasRequested,
    };
  });
  return NextResponse.json({ clans: result, total });
}

const createClanSchema = z.object({
  name: z.string().min(2).max(50),
  motto: z.string().max(200).optional(),
  region: z.string().min(2).max(50),
  emblemUrl: z.string().url().optional(),
});

const deleteClanSchema = z.object({
  clanId: z.string().min(1),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withValidation(createClanSchema, async (req: any) => {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, motto, region, emblemUrl } = req.validated;
  // Check for duplicate name
  const exists = await prisma.clan.findUnique({ where: { name } });
  if (exists)
    return NextResponse.json(
      { error: "Clan name already exists" },
      { status: 409 }
    );
  const clan = await prisma.clan.create({
    data: {
      name,
      motto,
      region,
      emblemUrl,
      memberships: { create: { userId, role: "LEADER" } },
    },
    include: { memberships: true },
  });
  return NextResponse.json({ clan });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withValidation(deleteClanSchema, async (request: any) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = currentUser.id;
    const { clanId } = request.validated;
    // Check if user is leader
    const membership = await prisma.clanMembership.findFirst({
      where: { clanId, userId, role: "LEADER" },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "Only clan leader can disband" },
        { status: 403 }
      );
    }
    await prisma.clan.delete({ where: { id: clanId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disbanding clan:", error);
    return NextResponse.json(
      { error: "Failed to disband clan" },
      { status: 500 }
    );
  }
});
