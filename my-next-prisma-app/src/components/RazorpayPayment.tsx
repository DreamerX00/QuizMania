'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  onClose: () => void;
  amount: number;
  currency?: string;
  description?: string;
  orderId: string;
  keyId: string;
}

export default function RazorpayPayment({
  onSuccess,
  onFailure,
  onClose,
  amount,
  currency = 'INR',
  description = 'Quiz Mania Premium Subscription',
  orderId,
  keyId
}: RazorpayPaymentProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded');
    };
    script.onerror = () => {
      setError('Failed to load payment gateway');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      setError('Payment gateway not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: 'Quiz Mania',
      description: description,
      order_id: orderId,
      handler: async function (response: any) {
        try {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/premium/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'verify_payment',
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            }),
          });

          const result = await verifyResponse.json();

          if (result.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            onFailure(result.error || 'Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          onFailure('Payment verification failed');
        }
      },
      prefill: {
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        contact: '',
      },
      notes: {
        userId: user?.id,
        type: 'premium_subscription',
      },
      theme: {
        color: '#6366f1',
      },
      modal: {
        ondismiss: () => {
          onClose();
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      setError('Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.Razorpay && orderId && keyId) {
      handlePayment();
    }
  }, [window.Razorpay, orderId, keyId]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Payment Error</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setError(null);
                handlePayment();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return null;
} 