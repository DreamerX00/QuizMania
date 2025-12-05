/**
 * Authorization Middleware - IDOR Protection
 * Ensures users can only access their own resources
 *
 * IDOR = Insecure Direct Object Reference
 * Example: User A tries to access /api/users/user-b-id/profile
 */

import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server"; // Not used - using NextAuth
import prisma from "@/lib/prisma";

/**
 * Authorization Error Response
 */
export function unauthorizedResponse(message = "Unauthorized access") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Verify user owns the resource
 */
export async function verifyResourceOwnership(
  resourceType: "quiz" | "package" | "attempt" | "comment" | "clan",
  resourceId: string,
  userId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case "quiz":
        const quiz = await prisma.quiz.findUnique({
          where: { id: resourceId },
          select: { creatorId: true },
        });
        return quiz?.creatorId === userId;

      case "package":
        const pkg = await prisma.quizPackage.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        return pkg?.userId === userId;

      case "attempt":
        const attempt = await prisma.aIQuizAttempt.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        return attempt?.userId === userId;

      case "comment":
        const comment = await prisma.quizComment.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        return comment?.userId === userId;

      case "clan":
        const membership = await prisma.clanMembership.findFirst({
          where: {
            clanId: resourceId,
            userId: userId,
          },
        });
        return !!membership;

      default:
        return false;
    }
  } catch (error) {
    console.error("Authorization check failed:", error);
    return false;
  }
}

/**
 * Verify user has specific role
 */
export async function verifyUserRole(
  userId: string,
  requiredRoles: string[]
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) return false;
    return requiredRoles.includes(user.role);
  } catch {
    return false;
  }
}

/**
 * Authorization middleware for user-owned resources
 *
 * Usage:
 * export const DELETE = withAuth(withOwnership('quiz', async (request, { quizId }) => {
 *   // User is verified owner, safe to delete
 * }));
 */
export function withOwnership(
  resourceType: "quiz" | "package" | "attempt" | "comment" | "clan",
  getResourceId: (
    request: NextRequest,
    context: Record<string, unknown>
  ) => string
) {
  return function ownershipMiddleware(
    handler: (
      request: NextRequest,
      context: Record<string, unknown>
    ) => Promise<NextResponse>
  ) {
    return async (
      request: NextRequest,
      context: Record<string, unknown>
    ): Promise<NextResponse> => {
      // TODO: Use NextAuth instead of Clerk
      // const { userId } = await auth();
      const currentUser = await import("@/lib/session").then((m) =>
        m.getCurrentUser()
      );
      const userId = (await currentUser)?.id;

      if (!userId) {
        return unauthorizedResponse("Authentication required");
      }

      const resourceId = getResourceId(request, context);
      const isOwner = await verifyResourceOwnership(
        resourceType,
        resourceId,
        userId
      );

      if (!isOwner) {
        return unauthorizedResponse(
          "You do not have permission to access this resource"
        );
      }

      return handler(request, context);
    };
  };
}

/**
 * Role-based access control middleware
 *
 * Usage:
 * export const GET = withRole(['ADMIN', 'MODERATOR'], async (request) => {
 *   // User has required role
 * });
 */
export function withRole(requiredRoles: string[]) {
  return function roleMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      // TODO: Use NextAuth instead of Clerk
      // const { userId } = await auth();
      const currentUser = await import("@/lib/session").then((m) =>
        m.getCurrentUser()
      );
      const userId = (await currentUser)?.id;

      if (!userId) {
        return unauthorizedResponse("Authentication required");
      }

      const hasRole = await verifyUserRole(userId, requiredRoles);

      if (!hasRole) {
        return unauthorizedResponse("Insufficient permissions");
      }

      return handler(request);
    };
  };
}

/**
 * Check if user can modify quiz/package (owner or admin)
 */
export async function canModifyResource(
  resourceType: "quiz" | "package",
  resourceId: string,
  userId: string
): Promise<boolean> {
  // Check ownership
  const isOwner = await verifyResourceOwnership(
    resourceType,
    resourceId,
    userId
  );
  if (isOwner) return true;

  // Check admin role
  return verifyUserRole(userId, ["ADMIN", "MODERATOR"]);
}
