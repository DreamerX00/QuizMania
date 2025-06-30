import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { RazorpayService } from '@/services/razorpayService';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only one plan: 'premium'
    const { plan } = await request.json();
    if (plan !== 'premium') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
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
    const order = await RazorpayService.createOrder(user.clerkId, amount);

    // Store order in database
    await prisma.paymentTransaction.create({
      data: {
        userId: user.clerkId,
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
}

// GET endpoint to check subscription status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
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