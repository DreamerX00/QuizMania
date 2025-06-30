import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { RazorpayService } from '@/services/razorpayService';

// This is the platform's main account where commission will be sent.
// In a real app, this should come from a secure config or environment variable.
// For Razorpay Route to work, you must add your own account as a linked account.
// See: https://razorpay.com/docs/route/getting-started/#add-a-linked-account
const PLATFORM_RAZORPAY_ACCOUNT_ID = process.env.RAZORPAY_PLATFORM_ACCOUNT_ID; 

// POST: Create a split payment order for a quiz purchase
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!PLATFORM_RAZORPAY_ACCOUNT_ID) {
      console.error("PLATFORM_RAZORPAY_ACCOUNT_ID is not set in environment variables.");
      return NextResponse.json({ error: 'Platform account not configured.' }, { status: 500 });
    }

    const { quizId } = await request.json();
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Check if the user has already unlocked this quiz
    const existingUnlock = await prisma.quizUnlock.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
    });

    if (existingUnlock) {
      return NextResponse.json({ error: 'You have already unlocked this quiz.' }, { status: 400 });
    }

    // 1. Fetch Quiz and Creator's Payout Info
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        creator: {
          include: {
            payoutAccount: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    if (!quiz.creator.payoutAccount?.razorpayAccountId) {
      return NextResponse.json({ error: 'Quiz creator has not set up payouts.' }, { status: 400 });
    }
    if (!quiz.pricePerAttempt || quiz.pricePerAttempt <= 0) {
        return NextResponse.json({ error: 'This quiz cannot be purchased (invalid price).' }, { status: 400 });
    }

    // 2. Calculate amounts (in paise)
    const totalAmount = quiz.pricePerAttempt * 100;
    const platformFee = Math.round(totalAmount * 0.10); // 10%
    const creatorAmount = totalAmount - platformFee;

    // 3. Define the transfers for Razorpay Route
    const transfers = [
      {
        account: quiz.creator.payoutAccount.razorpayAccountId,
        amount: creatorAmount,
        currency: 'INR',
        notes: {
          role: 'quiz_creator',
          quizId: quiz.id,
          creatorId: quiz.creator.clerkId
        },
      },
      {
        account: PLATFORM_RAZORPAY_ACCOUNT_ID,
        amount: platformFee,
        currency: 'INR',
        notes: {
          role: 'platform_fee',
          quizId: quiz.id
        },
      },
    ];

    // 4. Create Razorpay order with transfers
    const order = await RazorpayService.createOrderWithTransfers(userId, quiz.pricePerAttempt, transfers);

    // 5. Store transaction in database
    await prisma.paymentTransaction.create({
      data: {
        userId: userId,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: 'INR',
        status: 'PENDING',
        type: 'QUIZ_PURCHASE',
        metadata: {
          quizId: quiz.id,
          creatorId: quiz.creator.clerkId,
          transfers: transfers,
          description: `Purchase of quiz: ${quiz.title}`,
        },
      },
    });
    
    // 6. Return order to frontend
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      quizTitle: quiz.title,
      description: `Payment for ${quiz.title}`
    });

  } catch (error) {
    console.error('Quiz purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz purchase order' },
      { status: 500 }
    );
  }
} 