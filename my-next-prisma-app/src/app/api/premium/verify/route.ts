import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { RazorpayService } from '@/services/razorpayService';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const verifySchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export const POST = withValidation(verifySchema, async (request: any) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orderId, paymentId, signature } = request.validated;

    // Verify payment signature
    const isValidSignature = RazorpayService.verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Get payment details from Razorpay
    const paymentDetails = await RazorpayService.getPaymentDetails(paymentId);
    
    if (paymentDetails.status !== 'captured') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get payment transaction
    const paymentTransaction = await prisma.paymentTransaction.findFirst({
      where: {
        razorpayOrderId: orderId,
        userId: user.clerkId,
        status: 'PENDING'
      }
    });

    if (!paymentTransaction) {
      return NextResponse.json({ error: 'Payment transaction not found' }, { status: 404 });
    }

    // Ensure metadata is an object
    let existingMetadata: Record<string, any> = {};
    if (typeof paymentTransaction.metadata === 'string') {
      try {
        existingMetadata = JSON.parse(paymentTransaction.metadata);
      } catch {
        existingMetadata = {};
      }
    } else if (typeof paymentTransaction.metadata === 'object' && paymentTransaction.metadata !== null) {
      existingMetadata = paymentTransaction.metadata;
    }
    // Update payment transaction
    await prisma.paymentTransaction.update({
      where: { id: paymentTransaction.id },
      data: {
        razorpayPaymentId: paymentId,
        status: 'CAPTURED',
        metadata: {
          ...existingMetadata,
          razorpayPaymentId: paymentId,
          paymentStatus: paymentDetails.status,
          capturedAt: new Date().toISOString()
        }
      }
    });

    // Always add 1 month to premiumUntil for the premium plan
    const premiumUntil = new Date();
    premiumUntil.setMonth(premiumUntil.getMonth() + 1);

    // Update user to premium
    const updatedUser = await prisma.user.update({
      where: { clerkId: user.clerkId },
      data: {
        premiumUntil: premiumUntil,
        accountType: 'PREMIUM'
      },
      select: {
        clerkId: true,
        email: true,
        name: true,
        accountType: true,
        premiumUntil: true,
        points: true
      }
    });

    // Create or update premium summary
    await prisma.premiumSummary.upsert({
      where: { userId: user.clerkId },
      update: {},
      create: {
        userId: user.clerkId,
        templatesUsed: 0,
        quizPacks: 0,
        timeSaved: 0,
        dollarValue: 0
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Premium subscription activated successfully',
      user: updatedUser,
      premiumUntil: premiumUntil,
      plan: 'premium',
      paymentId: paymentId
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}); 