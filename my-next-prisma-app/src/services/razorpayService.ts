import Razorpay from 'razorpay';
import crypto from 'crypto';

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
    return process.env.NODE_ENV === 'development' || 
           process.env.RAZORPAY_KEY_ID?.includes('rzp_test_') ||
           process.env.RAZORPAY_KEY_ID?.includes('rzp_test');
  }

  /**
   * Get test card information for development
   */
  static getTestCards(): TestCardInfo[] {
    return [
      {
        number: '4111 1111 1111 1111',
        name: 'Test User',
        expiry: '12/25',
        cvv: '123',
        description: 'Success - Standard card'
      },
      {
        number: '4000 0000 0000 0002',
        name: 'Test User',
        expiry: '12/25',
        cvv: '123',
        description: 'Failure - Insufficient funds'
      },
      {
        number: '4000 0000 0000 9995',
        name: 'Test User',
        expiry: '12/25',
        cvv: '123',
        description: 'Failure - Card declined'
      },
      {
        number: '4000 0000 0000 9987',
        name: 'Test User',
        expiry: '12/25',
        cvv: '123',
        description: 'Failure - Lost card'
      },
      {
        number: '4000 0000 0000 9979',
        name: 'Test User',
        expiry: '12/25',
        cvv: '123',
        description: 'Failure - Stolen card'
      }
    ];
  }

  /**
   * Create a new Razorpay order for premium subscription
   */
  static async createOrder(userId: string, amount: number): Promise<any> {
    try {
      const orderData: RazorpayOrderData = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `prem_${Date.now()}`, // Shorter receipt format (max 40 chars)
        notes: {
          userId: userId,
          type: 'premium_subscription',
          description: 'Quiz Mania Premium Subscription',
          testMode: this.isTestMode().toString()
        }
      };

      const order = await razorpay.orders.create(orderData);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Create a Razorpay order with transfers for split payments
   */
  static async createOrderWithTransfers(
    userId: string,
    amount: number,
    transfers: any[]
  ): Promise<any> {
    try {
      const orderData: any = {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `quiz_sale_${Date.now()}`,
        notes: {
          userId: userId,
          type: 'quiz_purchase',
          testMode: this.isTestMode().toString()
        },
        transfers: transfers,
      };

      const order = await razorpay.orders.create(orderData);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order with transfers:', error);
      throw new Error('Failed to create split payment order');
    }
  }

  /**
   * Create a Razorpay Contact
   */
  static async createContact(name: string, email: string): Promise<any> {
    try {
      const contact = await razorpay.contacts.create({
        name: name,
        email: email,
        type: 'vendor', // 'vendor' is more appropriate for marketplace creators
      });
      return contact;
    } catch (error) {
      console.error('Error creating Razorpay contact:', error);
      throw new Error('Failed to create Razorpay contact');
    }
  }

  /**
   * Create a Razorpay Fund Account (for UPI)
   */
  static async createUpiFundAccount(
    contactId: string,
    upiId: string
  ): Promise<any> {
    try {
      const fundAccount = await razorpay.fundAccount.create({
        contact_id: contactId,
        account_type: 'vpa',
        vpa: {
          address: upiId,
        },
      });
      return fundAccount;
    } catch (error) {
      console.error('Error creating UPI fund account:', error);
      throw new Error('Failed to create UPI fund account');
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
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest('hex');

      return generated_signature === signature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   */
  static async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Fetch order details from Razorpay
   */
  static async getOrderDetails(orderId: string): Promise<any> {
    try {
      const order = await razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const refundData: any = {};
      if (amount) {
        refundData.amount = amount * 100; // Convert to paise
      }

      const refund = await razorpay.payments.refund(paymentId, refundData);
      return refund;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }
} 