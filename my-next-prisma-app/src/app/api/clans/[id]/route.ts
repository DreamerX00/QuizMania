import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await context.params;
    const clanId = params.id;
    const clan = await prisma.clan.findUnique({
      where: { id: clanId },
      include: {
        memberships: { include: { user: true } },
        joinRequests: { include: { user: true } },
        chatMessages: {
          include: { sender: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });
    if (!clan)
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    return NextResponse.json({ clan });
  } catch (error) {
    console.error("Error fetching clan details:", error);
    return NextResponse.json(
      { error: "Failed to fetch clan details" },
      { status: 500 }
    );
  }
}

const updateClanSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  motto: z.string().max(200).optional(),
  emblemUrl: z.string().url().optional(),
});

export const PATCH = withValidation(
  updateClanSchema,
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const params = await context.params;
      const clanId = params.id;
      const { name, motto, emblemUrl } = (
        request as never as { validated: z.infer<typeof updateClanSchema> }
      ).validated;
      // Only leader can update
      const membership = await prisma.clanMembership.findFirst({
        where: { clanId, userId, role: "LEADER" },
      });
      if (!membership)
        return NextResponse.json(
          { error: "Only leader can update clan" },
          { status: 403 }
        );
      const updated = await prisma.clan.update({
        where: { id: clanId },
        data: { name, motto, emblemUrl },
      });
      return NextResponse.json({ clan: updated });
    } catch (error) {
      console.error("Error updating clan:", error);
      return NextResponse.json(
        { error: "Failed to update clan" },
        { status: 500 }
      );
    }
  }
);
