import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
// NO cache - real-time join requests

// GET: List join requests for a clan (leader/elder only)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const clanId = searchParams.get("clanId");
    if (!clanId) {
      return NextResponse.json({ error: "Clan ID required" }, { status: 400 });
    }
    // Only leader/elder can view
    const membership = await prisma.clanMembership.findFirst({
      where: { clanId, userId, role: { in: ["LEADER", "ELDER"] } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const requests = await prisma.clanJoinRequest.findMany({
      where: { clanId, status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error listing join requests:", error);
    return NextResponse.json(
      { error: "Failed to list join requests" },
      { status: 500 }
    );
  }
}

// POST: Send, accept, or decline a join request
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { clanId, action, requestId } = await request.json();
    if (action === "send") {
      // User sends join request
      if (!clanId)
        return NextResponse.json(
          { error: "Clan ID required" },
          { status: 400 }
        );
      // Check not already a member or requested
      const existing =
        (await prisma.clanMembership.findFirst({
          where: { clanId, userId },
        })) ||
        (await prisma.clanJoinRequest.findFirst({
          where: { clanId, userId, status: "PENDING" },
        }));
      if (existing)
        return NextResponse.json(
          { error: "Already a member or requested" },
          { status: 409 }
        );
      const req = await prisma.clanJoinRequest.create({
        data: { clanId, userId, status: "PENDING" },
      });
      return NextResponse.json({ request: req });
    } else if (action === "accept" || action === "decline") {
      // Only leader/elder can accept/decline
      if (!requestId)
        return NextResponse.json(
          { error: "Request ID required" },
          { status: 400 }
        );
      const joinReq = await prisma.clanJoinRequest.findUnique({
        where: { id: requestId },
        include: { clan: true },
      });
      if (!joinReq)
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
        );
      const membership = await prisma.clanMembership.findFirst({
        where: {
          clanId: joinReq.clanId,
          userId,
          role: { in: ["LEADER", "ELDER"] },
        },
      });
      if (!membership)
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      // Accept: add to clan, update request
      if (action === "accept") {
        await prisma.clanMembership.create({
          data: {
            clanId: joinReq.clanId,
            userId: joinReq.userId,
            role: "MEMBER",
          },
        });
      }
      const updated = await prisma.clanJoinRequest.update({
        where: { id: requestId },
        data: { status: action === "accept" ? "ACCEPTED" : "DECLINED" },
      });
      return NextResponse.json({ request: updated });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error handling join request:", error);
    return NextResponse.json(
      { error: "Failed to handle join request" },
      { status: 500 }
    );
  }
}
