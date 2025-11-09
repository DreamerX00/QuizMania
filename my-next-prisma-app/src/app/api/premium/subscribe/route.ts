import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';
import { RazorpayService } from '@/services/razorpayService';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const subscribeSchema = z.object({
  plan: z.literal('premium'),
});

export const POST = withValidation(subscribeSchema, async (request: any) => {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { plan } = request.validated;
    // Only one plan: 'premium'
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Check if user already has active premium
    if (user.premiumUntil && user.premiumUntil > new Date()) {
      return NextResponse.json({ 
        error: 'User already has active premium subscription' 
      }, { status: 400 });
    }
    // Set price for premium plan (₹400)
    const amount = 400; // Amount in INR, service will convert to paise
    // Create Razorpay order
    const order = await RazorpayService.createOrder(user.id, amount);
    // Store order in database
    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        amount: order.amount, // Use amount from the created order (in paise)
        currency: 'INR',
        status: 'PENDING',
        type: 'PREMIUM_SUBSCRIPTION',
        metadata: {
          plan: 'premium',
          description: `Quiz Mania Premium Subscription`,
          testMode: RazorpayService.isTestMode()
        }
      }
    });
    // Return order details with test mode info
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      testMode: RazorpayService.isTestMode(),
      testCards: RazorpayService.isTestMode() ? RazorpayService.getTestCards() : null,
      plan: 'premium',
      description: `Quiz Mania Premium Subscription`
    });
  } catch (error) {
    console.error('Premium subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription order' },
      { status: 500 }
    );
  }
});

// GET endpoint to check subscription status
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountType: true,
        premiumUntil: true,
        points: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPremium = user.accountType === 'PREMIUM' || user.accountType === 'LIFETIME';
    const isActive = isPremium && (!user.premiumUntil || user.premiumUntil > new Date());

    return NextResponse.json({
      isPremium,
      isActive,
      accountType: user.accountType,
      premiumUntil: user.premiumUntil,
      points: user.points
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
