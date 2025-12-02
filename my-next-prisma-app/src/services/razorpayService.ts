import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface RazorpayOrderData {
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface TestCardInfo {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  description: string;
}

export class RazorpayService {
  /**
   * Check if we're in test mode
   */
  static isTestMode(): boolean {
    return Boolean(
      process.env.NODE_ENV === "development" ||
        process.env.RAZORPAY_KEY_ID?.includes("rzp_test_") ||
        process.env.RAZORPAY_KEY_ID?.includes("rzp_test")
    );
  }

  /**
   * Get test card information for development (secured)
   * Only available in development environment
   */
  static getTestCards(): TestCardInfo[] {
    // Only return test cards in development mode
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    // Return minimal test card info for development only
    return [
      {
        number: "4111 1111 1111 1111",
        name: "Test User",
        expiry: "12/25",
        cvv: "123",
        description: "Development test card only",
      },
    ];
  }

  /**
   * Create a new Razorpay order for premium subscription
   */
  static async createOrder(
    userId: string,
    amount: number
  ): Promise<{
    id: string;
    amount: number;
    currency: string;
    [key: string]: unknown;
  }> {
    try {
      const orderData: RazorpayOrderData = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `prem_${Date.now()}`, // Shorter receipt format (max 40 chars)
        notes: {
          userId: userId,
          type: "premium_subscription",
          description: "Quiz Mania Premium Subscription",
          testMode: this.isTestMode().toString(),
        },
      };

      const order = await razorpay.orders.create(orderData);
      return order as unknown as {
        id: string;
        amount: number;
        currency: string;
        [key: string]: unknown;
      };
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new Error("Failed to create payment order");
    }
  }

  /**
   * Create a Razorpay order with transfers for split payments
   */
  static async createOrderWithTransfers(
    userId: string,
    amount: number,
    transfers: Array<{
      account: string;
      amount: number;
      currency: string;
      [key: string]: unknown;
    }>
  ): Promise<{
    id: string;
    amount: number;
    currency: string;
    [key: string]: unknown;
  }> {
    try {
      const orderData: {
        amount: number;
        currency: string;
        receipt: string;
        notes: { userId: string; type: string; testMode: string };
        transfers: unknown[];
      } = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `quiz_sale_${Date.now()}`,
        notes: {
          userId: userId,
          type: "quiz_purchase",
          testMode: this.isTestMode().toString(),
        },
        transfers: transfers,
      };

      const order = await razorpay.orders.create(orderData);
      return order as unknown as {
        id: string;
        amount: number;
        currency: string;
        [key: string]: unknown;
      };
    } catch (error) {
      console.error("Error creating Razorpay order with transfers:", error);
      throw new Error("Failed to create split payment order");
    }
  }

  /**
   * Create a Razorpay Contact
   */
  static async createContact(
    name: string,
    email: string
  ): Promise<{ id: string; [key: string]: unknown }> {
    try {
      // Type assertion to access contacts API which may not be in type definitions
      const contact = await (
        razorpay as unknown as {
          contacts: {
            create: (data: Record<string, unknown>) => Promise<{ id: string }>;
          };
        }
      ).contacts.create({
        name: name,
        email: email,
        type: "vendor", // 'vendor' is more appropriate for marketplace creators
      });
      return contact;
    } catch (error) {
      console.error("Error creating Razorpay contact:", error);
      throw new Error("Failed to create Razorpay contact");
    }
  }

  /**
   * Create a Razorpay Fund Account (for UPI)
   */
  static async createUpiFundAccount(
    contactId: string,
    upiId: string
  ): Promise<{ id: string; [key: string]: unknown }> {
    try {
      // Type assertion for contact_id which may not be in type definitions
      const fundAccount = await razorpay.fundAccount.create({
        contact_id: contactId,
        account_type: "vpa",
        vpa: {
          address: upiId,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      return fundAccount as unknown as { id: string; [key: string]: unknown };
    } catch (error) {
      console.error("Error creating UPI fund account:", error);
      throw new Error("Failed to create UPI fund account");
    }
  }

  /**
   * Verify payment signature
   */
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest("hex");

      return generated_signature === signature;
    } catch (error) {
      console.error("Error verifying payment signature:", error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   */
  static async getPaymentDetails(
    paymentId: string
  ): Promise<{ id: string; [key: string]: unknown }> {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment as unknown as { id: string; [key: string]: unknown };
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw new Error("Failed to fetch payment details");
    }
  }

  /**
   * Fetch order details from Razorpay
   */
  static async getOrderDetails(
    orderId: string
  ): Promise<{ id: string; [key: string]: unknown }> {
    try {
      const order = await razorpay.orders.fetch(orderId);
      return order as unknown as { id: string; [key: string]: unknown };
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw new Error("Failed to fetch order details");
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(
    paymentId: string,
    amount?: number
  ): Promise<{ id: string; [key: string]: unknown }> {
    try {
      const refundData: { amount?: number } = {};
      if (amount) {
        refundData.amount = amount * 100; // Convert to paise
      }

      const refund = await razorpay.payments.refund(paymentId, refundData);
      return refund as unknown as { id: string; [key: string]: unknown };
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw new Error("Failed to refund payment");
    }
  }
}
