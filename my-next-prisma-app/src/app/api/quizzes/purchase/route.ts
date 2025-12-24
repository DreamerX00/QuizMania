import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { RazorpayService } from "@/services/razorpayService";
import { QuizAttemptService } from "@/services/quizAttemptService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

// Platform fee: 30%
const PLATFORM_FEE_PERCENTAGE = 0.3;

const purchaseQuizSchema = z.object({
  quizId: z.string().min(1),
});

export const POST = withValidation(purchaseQuizSchema, async (request) => {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = request.validated;
    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // Check if the user has already unlocked this quiz
    const quiz = await QuizAttemptService.resolveQuizIdentifier(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if already purchased
    const existingUnlock = await prisma.quizUnlock.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId: quiz.id,
        },
      },
    });

    if (existingUnlock) {
      return NextResponse.json(
        { error: "You have already purchased this quiz" },
        { status: 400 }
      );
    }

    if (!quiz.creatorId) {
      return NextResponse.json(
        { error: "Quiz has no creator" },
        { status: 400 }
      );
    }

    // Fetch the creator with payout account
    const creator = await prisma.user.findUnique({
      where: { id: quiz.creatorId },
      include: { payoutAccount: true },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Quiz creator not found." },
        { status: 400 }
      );
    }

    // Check if creator has a payout account set up
    if (!creator.payoutAccount) {
      return NextResponse.json(
        {
          error:
            "Quiz creator has not set up payouts. Please contact the creator.",
        },
        { status: 400 }
      );
    }

    if (!quiz.pricePerAttempt || quiz.pricePerAttempt <= 0) {
      return NextResponse.json(
        { error: "This quiz cannot be purchased (invalid price)." },
        { status: 400 }
      );
    }

    // Calculate amounts (in paise for Razorpay)
    const totalAmountPaise = quiz.pricePerAttempt * 100;
    const platformFeePaise = Math.round(
      totalAmountPaise * PLATFORM_FEE_PERCENTAGE
    );
    const creatorAmountPaise = totalAmountPaise - platformFeePaise;

    // Create a simple Razorpay order (no Route/split - full payment to platform)
    const order = await RazorpayService.createOrder(
      userId,
      quiz.pricePerAttempt
    );

    // Store transaction in database with creator share info
    await prisma.paymentTransaction.create({
      data: {
        userId: userId,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: "INR",
        status: "PENDING",
        type: "QUIZ_PURCHASE",
        metadata: {
          quizId: quiz.id,
          quizTitle: quiz.title,
          creatorId: creator.id,
          creatorPayoutAccountId: creator.payoutAccount.id,
          // Store amounts for later payout processing
          totalAmount: totalAmountPaise,
          platformFee: platformFeePaise,
          creatorShare: creatorAmountPaise,
          platformFeePercentage: PLATFORM_FEE_PERCENTAGE * 100,
          description: `Purchase of quiz: ${quiz.title}`,
        },
      },
    });

    // Return order to frontend
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      quizTitle: quiz.title,
      description: `Payment for ${quiz.title}`,
      // Show creator share info (useful for UI)
      breakdown: {
        total: quiz.pricePerAttempt,
        platformFee: platformFeePaise / 100,
        creatorShare: creatorAmountPaise / 100,
      },
    });
  } catch (error) {
    console.error("Quiz purchase error:", error);
    return NextResponse.json(
      { error: "Failed to create quiz purchase order" },
      { status: 500 }
    );
  }
});
