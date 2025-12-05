import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { RazorpayService } from "@/services/razorpayService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";
import { getRedisClient } from "@/lib/redis";

const subscribeSchema = z.object({
  plan: z.literal("premium"),
  idempotencyKey: z.string().uuid().optional(),
});

export const POST = withValidation(
  subscribeSchema,
  async (request: NextRequest) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Extract idempotency key from validated request
      const { idempotencyKey } = (
        request as typeof request & {
          validated: { plan: string; idempotencyKey?: string };
        }
      ).validated;

      // 🚀 Check Redis cache for idempotency (if key provided)
      const redis = getRedisClient();
      if (redis && idempotencyKey) {
        const cacheKey = `payment:subscribe:${userId}:${idempotencyKey}`;
        try {
          const cached = await redis.get(cacheKey);
          if (cached) {
            console.log(
              `[IDEMPOTENCY] Returning cached payment order for ${cacheKey}`
            );
            return NextResponse.json(JSON.parse(cached));
          }
        } catch (err) {
          console.error("Redis get error:", err);
          // Continue without cache
        }
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user already has active premium
      if (user.premiumUntil && user.premiumUntil > new Date()) {
        return NextResponse.json(
          {
            error: "User already has active premium subscription",
          },
          { status: 400 }
        );
      }

      // Check for existing pending order for this user (additional safety)
      const existingPendingOrder = await prisma.paymentTransaction.findFirst({
        where: {
          userId: user.id,
          status: "PENDING",
          type: "PREMIUM_SUBSCRIPTION",
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000), // Within last 15 minutes
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (existingPendingOrder) {
        console.log(
          `[IDEMPOTENCY] Found existing pending order: ${existingPendingOrder.razorpayOrderId}`
        );
        const existingResponse = {
          orderId: existingPendingOrder.razorpayOrderId,
          amount: existingPendingOrder.amount,
          currency: existingPendingOrder.currency,
          key: process.env.RAZORPAY_KEY_ID,
          testMode: RazorpayService.isTestMode(),
          testCards: RazorpayService.isTestMode()
            ? RazorpayService.getTestCards()
            : null,
          plan: "premium",
          description: `Quiz Mania Premium Subscription`,
        };
        return NextResponse.json(existingResponse);
      }

      // Set price for premium plan (₹400)
      const amount = 400; // Amount in INR, service will convert to paise

      // Create Razorpay order with idempotency
      const order = await RazorpayService.createOrder(user.id, amount);
      // Store order in database
      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          razorpayOrderId: order.id,
          amount: order.amount, // Use amount from the created order (in paise)
          currency: "INR",
          status: "PENDING",
          type: "PREMIUM_SUBSCRIPTION",
          metadata: {
            plan: "premium",
            description: `Quiz Mania Premium Subscription`,
            testMode: RazorpayService.isTestMode(),
            idempotencyKey: idempotencyKey || null,
          },
        },
      });

      // Prepare response
      const responseData = {
        orderId: order.id,
        amount: order.amount,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
        testMode: RazorpayService.isTestMode(),
        testCards: RazorpayService.isTestMode()
          ? RazorpayService.getTestCards()
          : null,
        plan: "premium",
        description: `Quiz Mania Premium Subscription`,
      };

      // 💾 Cache the result (15 minute TTL - enough for payment flow)
      if (redis && idempotencyKey) {
        const cacheKey = `payment:subscribe:${userId}:${idempotencyKey}`;
        try {
          await redis.setex(cacheKey, 900, JSON.stringify(responseData)); // 15 min
        } catch (err) {
          console.error("Redis setex error:", err);
          // Continue without caching
        }
      }

      // Return order details with test mode info
      return NextResponse.json(responseData);
    } catch (error) {
      console.error("Premium subscription error:", error);
      return NextResponse.json(
        { error: "Failed to create subscription order" },
        { status: 500 }
      );
    }
  }
);

// GET endpoint to check subscription status
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountType: true,
        premiumUntil: true,
        points: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPremium =
      user.accountType === "PREMIUM" || user.accountType === "LIFETIME";
    const isActive =
      isPremium && (!user.premiumUntil || user.premiumUntil > new Date());

    return NextResponse.json({
      isPremium,
      isActive,
      accountType: user.accountType,
      premiumUntil: user.premiumUntil,
      points: user.points,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
