import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export interface AdminUser {
  clerkId: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Middleware to protect admin routes
 * Call this at the beginning of admin API routes and pages
 */
export async function requireAdmin(): Promise<{
  user: AdminUser | null;
  error: NextResponse | null;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        user: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    // Get user from database to check admin status
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        clerkId: true,
        email: true,
        name: true,
        accountType: true,
        // Add these fields to your User model:
        // isAdmin: true,
        // isSuperAdmin: true,
      },
    });

    if (!user) {
      return {
        user: null,
        error: NextResponse.json({ error: "User not found" }, { status: 404 }),
      };
    }

    // Check if user has admin privileges
    // TODO: Update this logic based on your admin system
    const isAdmin = user.email?.endsWith("@yourdomain.com");
    const isSuperAdmin = user.email === "admin@yourdomain.com"; // Update with your admin email

    if (!isAdmin) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        ),
      };
    }

    return {
      user: {
        clerkId: user.clerkId,
        email: user.email || "",
        name: user.name || "",
        isAdmin,
        isSuperAdmin,
      },
      error: null,
    };
  } catch (error) {
    console.error("Admin auth error:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Rate limiting for admin actions
 */
const adminActionCounts = new Map<
  string,
  { count: number; resetTime: number }
>();

export function rateLimit(
  adminId: string,
  maxActions: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userActions = adminActionCounts.get(adminId);

  if (!userActions || now > userActions.resetTime) {
    adminActionCounts.set(adminId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userActions.count >= maxActions) {
    return false;
  }

  userActions.count++;
  return true;
}

/**
 * Log admin actions for audit trail
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetId?: string,
  details?: Record<string, string | number | boolean | undefined>
) {
  try {
    // TODO: Create AdminLog model in your Prisma schema
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        details: details as never,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
