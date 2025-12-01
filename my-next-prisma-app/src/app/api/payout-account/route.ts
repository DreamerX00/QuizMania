import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { RazorpayService } from "@/services/razorpayService";
import { z } from "zod";
import { withValidation } from "@/utils/validation";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

// GET: Check if user has a payout account
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payoutAccount = await prisma.payoutAccount.findUnique({
      where: { userId },
    });

    if (payoutAccount) {
      return NextResponse.json({
        hasAccount: true,
        account: {
          accountType: payoutAccount.accountType,
          accountDetails: payoutAccount.accountDetails,
          isVerified: payoutAccount.isVerified,
          createdAt: payoutAccount.createdAt,
        },
      });
    } else {
      return NextResponse.json({ hasAccount: false });
    }
  } catch (error) {
    console.error("Error fetching payout account:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout account" },
      { status: 500 }
    );
  }
}

const payoutAccountSchema = z.object({
  upiId: z.string().min(3).max(100),
});

export const POST = withValidation(
  payoutAccountSchema,
  async (request: any) => {
    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.email) {
        return NextResponse.json(
          { error: "User not found or email missing" },
          { status: 404 }
        );
      }
      // Check if user already has a payout account
      const existingAccount = await prisma.payoutAccount.findUnique({
        where: { userId },
      });
      if (existingAccount) {
        return NextResponse.json(
          { error: "Payout account already exists" },
          { status: 400 }
        );
      }
      const { upiId } = request.validated;
      // 1. Create a Razorpay Contact
      const contact = await RazorpayService.createContact(
        user.name || "Quiz Creator",
        user.email
      );
      if (!contact || !contact.id) {
        throw new Error("Failed to create Razorpay Contact");
      }
      // 2. Create a Razorpay Fund Account (VPA for UPI)
      const fundAccount = await RazorpayService.createUpiFundAccount(
        contact.id,
        upiId
      );
      if (!fundAccount || !fundAccount.id) {
        throw new Error("Failed to create Razorpay Fund Account");
      }
      // 3. Save the PayoutAccount in our database
      const newPayoutAccount = await prisma.payoutAccount.create({
        data: {
          userId: userId,
          razorpayAccountId: fundAccount.id,
          accountType: "upi",
          accountDetails: {
            upiId: upiId,
            contactId: contact.id,
          },
        },
      });
      return NextResponse.json({
        success: true,
        message: "Payout account created successfully!",
        payoutAccount: {
          id: newPayoutAccount.id,
          razorpayAccountId: newPayoutAccount.razorpayAccountId,
        },
      });
    } catch (error) {
      console.error("Error creating payout account:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json(
        { error: "Failed to create payout account", details: errorMessage },
        { status: 500 }
      );
    }
  }
);
