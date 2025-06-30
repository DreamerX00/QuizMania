import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RazorpayService } from '@/services/razorpayService';
import prisma from '@/lib/prisma';
import { PREMIUM_SUBSCRIPTION_PRICE } from '@/constants/pricing';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's payment transactions
    const transactions = await prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        clerkId: true,
        name: true,
        email: true,
        accountType: true,
        premiumUntil: true,
        points: true
      }
    });

    return NextResponse.json({
      success: true,
      user,
      transactions: transactions.map(t => ({
        id: t.id,
        orderId: t.razorpayOrderId,
        paymentId: t.razorpayPaymentId,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        type: t.type,
        createdAt: t.createdAt
      })),
      totalTransactions: transactions.length,
      subscriptionPrice: PREMIUM_SUBSCRIPTION_PRICE
    });

  } catch (error) {
    console.error('Error testing Razorpay integration:', error);
    return NextResponse.json(
      { error: 'Failed to test Razorpay integration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'create_test_order') {
      // Create a test order (small amount for testing)
      const testAmount = 100; // ₹1 for testing
      const order = await RazorpayService.createOrder(userId, testAmount);
      
      // Store test transaction
      await prisma.paymentTransaction.create({
        data: {
          userId,
          razorpayOrderId: order.id,
          amount: order.amount,
          currency: order.currency,
          type: 'PREMIUM_SUBSCRIPTION',
          description: 'Test Premium Subscription',
          metadata: {
            orderId: order.id,
            receipt: order.receipt,
            isTest: true
          }
        }
      });

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID
        },
        message: 'Test order created successfully'
      });
    }

    if (action === 'simulate_payment_success') {
      // Simulate a successful payment (for testing without actual payment)
      const { orderId } = await request.json();
      
      // Update transaction status
      await prisma.paymentTransaction.update({
        where: { razorpayOrderId: orderId },
        data: { status: 'CAPTURED' }
      });

      // Activate premium for test
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30);

      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          accountType: 'PREMIUM',
          premiumUntil: premiumUntil
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Test payment simulated successfully',
        premiumUntil: premiumUntil
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in test Razorpay action:', error);
    return NextResponse.json(
      { error: 'Failed to process test action' },
      { status: 500 }
    );
  }
} 