import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sanitizeObject } from "@/utils/validation";

const razorpayWebhookSchema = z.object({
  event: z.string().min(1),
  payload: z.object({
    payment: z.object({ entity: z.any() }).optional(),
    order: z.object({ entity: z.any() }).optional(),
  }),
});

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    // Validate event and payload
    const result = razorpayWebhookSchema.safeParse(event);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid webhook payload", details: result.error.errors },
        { status: 400 }
      );
    }
    const { event: eventType, payload } = sanitizeObject(result.data);
    console.log("Razorpay webhook received:", eventType, payload);
    switch (eventType) {
      case "payment.captured":
        if (payload.payment && payload.payment.entity) {
          await handlePaymentCaptured(payload.payment.entity);
        }
        break;
      case "payment.failed":
        if (payload.payment && payload.payment.entity) {
          await handlePaymentFailed(payload.payment.entity);
        }
        break;
      case "order.paid":
        if (payload.order && payload.order.entity) {
          await handleOrderPaid(payload.order.entity);
        }
        break;
      default:
        console.log("Unhandled webhook event:", eventType);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
};

async function handlePaymentCaptured(payment: {
  id: string;
  amount: number;
  [key: string]: unknown;
}) {
  try {
    // Update payment transaction status
    await prisma.paymentTransaction.updateMany({
      where: { razorpayPaymentId: payment.id },
      data: { status: "CAPTURED" },
    });

    // If this is a premium subscription payment, activate premium
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { razorpayPaymentId: payment.id },
      include: { user: true },
    });

    if (transaction && transaction.type === "PREMIUM_SUBSCRIPTION") {
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30);

      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          accountType: "PREMIUM",
          premiumUntil: premiumUntil,
        },
      });

      // Create or update premium summary
      await prisma.premiumSummary.upsert({
        where: { userId: transaction.userId },
        update: {},
        create: {
          userId: transaction.userId,
          templatesUsed: 0,
          quizPacks: 0,
          timeSaved: 0,
          dollarValue: 0,
        },
      });

      console.log(`Premium activated for user: ${transaction.userId}`);
    }
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

async function handlePaymentFailed(payment: {
  id: string;
  [key: string]: unknown;
}) {
  try {
    // Update payment transaction status
    await prisma.paymentTransaction.updateMany({
      where: { razorpayPaymentId: payment.id },
      data: { status: "FAILED" },
    });

    console.log(`Payment failed for payment ID: ${payment.id}`);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handleOrderPaid(order: { id: string; [key: string]: unknown }) {
  try {
    // Update payment transaction status
    await prisma.paymentTransaction.updateMany({
      where: { razorpayOrderId: order.id },
      data: { status: "CAPTURED" },
    });

    console.log(`Order paid for order ID: ${order.id}`);
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
}
