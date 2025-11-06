import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';
import { RazorpayService } from '@/services/razorpayService';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const verifyQuizSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

export const POST = withValidation(verifyQuizSchema, async (request: any) => {
  try {
    const currentUser = await getCurrentUser();
  const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orderId, paymentId, signature } = request.validated;

    // 1. Verify payment signature
    const isValidSignature = RazorpayService.verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Fetch the transaction from our database
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { razorpayOrderId: orderId },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    if (transaction.userId !== userId) {
        return NextResponse.json({ error: 'Transaction does not belong to user' }, { status: 403 });
    }
    if (transaction.status === 'CAPTURED') {
        return NextResponse.json({ success: true, message: 'Quiz already unlocked.' });
    }

    // 3. Update payment transaction status
    await prisma.paymentTransaction.update({
      where: { razorpayOrderId: orderId },
      data: {
        razorpayPaymentId: paymentId,
        status: 'CAPTURED',
      },
    });

    // 4. Grant user access to the quiz by creating a QuizUnlock record
    const quizId = (transaction.metadata as any)?.quizId;
    if (!quizId) {
        console.error(`Could not find quizId in transaction metadata for order ${orderId}`);
        // The payment is captured, but we can't grant access. This needs monitoring.
        return NextResponse.json({ error: 'Could not grant quiz access, please contact support.' }, { status: 500 });
    }

    // Use upsert to prevent race conditions. If the unlock record exists, do nothing.
    await prisma.quizUnlock.upsert({
        where: {
            userId_quizId: {
                userId,
                quizId
            }
        },
        update: {},
        create: {
            userId,
            quizId,
        }
    });

    return NextResponse.json({
      success: true,
      message: 'Quiz purchased and unlocked successfully!',
      quizId: quizId,
    });

  } catch (error) {
    console.error('Quiz purchase verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to verify quiz purchase', details: errorMessage },
      { status: 500 }
    );
  }
}); 