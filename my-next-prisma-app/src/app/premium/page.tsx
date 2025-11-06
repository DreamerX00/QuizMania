"use client";
import React, { useState } from 'react';
import { Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const freeFeatures = [
  { icon: '🆓', text: 'Access to standard quizzes' },
  { icon: '🔄', text: '3 attempts per quiz per day' },
  { icon: '📊', text: 'Basic analytics' },
  { icon: '🚫', text: 'Premium quizzes locked' },
  { icon: '💬', text: 'No direct creator chat' },
];

const premiumFeatures = [
  { icon: '👑', text: 'Unlimited access to premium-tier quizzes' },
  { icon: '🔟', text: 'Up to 10 attempts per quiz per day' },
  { icon: '📈', text: 'Detailed Quiz Analytics' },
  { icon: '🤖', text: 'AI-Powered Quiz Recommendations & Summary' },
  { icon: '📦', text: 'Access to Package Bundles' },
  { icon: '🏆', text: 'Monthly Leaderboard Awards' },
  { icon: '💬', text: 'Direct Chat with Quiz Creators (Coming Soon)' },
];

const quizPricing = [
  { difficulty: 'Super Easy', price: '₹0', points: 0, premium: false, emoji: '🟢' },
  { difficulty: 'Easy', price: '₹5', points: 10, premium: false, emoji: '🟢' },
  { difficulty: 'Normal', price: '₹10', points: 15, premium: false, emoji: '🟢' },
  { difficulty: 'Medium', price: '₹10', points: 15, premium: false, emoji: '🟡' },
  { difficulty: 'Hard', price: '₹20', points: 50, premium: false, emoji: '🟠' },
  { difficulty: 'Impossible', price: '₹50', points: 70, premium: false, emoji: '🔴' },
  { difficulty: 'Insane', price: '₹20', points: 400, premium: true, emoji: '💎' },
  { difficulty: 'JEE Main', price: '₹30', points: 600, premium: true, emoji: '📚' },
  { difficulty: 'JEE Advanced', price: '₹50', points: 800, premium: true, emoji: '🎓' },
  { difficulty: 'NEET (UG)', price: '₹40', points: 700, premium: true, emoji: '🩺' },
  { difficulty: 'UPSC (CSE)', price: '₹70', points: 1000, premium: true, emoji: '🏛️' },
  { difficulty: 'GATE', price: '₹50', points: 850, premium: true, emoji: '🛠️' },
  { difficulty: 'CAT', price: '₹60', points: 750, premium: true, emoji: '📈' },
  { difficulty: 'CLAT', price: '₹40', points: 600, premium: true, emoji: '⚖️' },
  { difficulty: 'CA', price: '₹30', points: 500, premium: true, emoji: '💹' },
  { difficulty: 'GAOKAO', price: '₹80', points: 1100, premium: true, emoji: '🌏' },
  { difficulty: 'GRE', price: '₹60', points: 800, premium: true, emoji: '📝' },
  { difficulty: 'GMAT', price: '₹65', points: 900, premium: true, emoji: '💼' },
  { difficulty: 'USMLE', price: '₹75', points: 950, premium: true, emoji: '🧬' },
  { difficulty: 'LNAT', price: '₹50', points: 800, premium: true, emoji: '📜' },
  { difficulty: 'MCAT', price: '₹70', points: 900, premium: true, emoji: '🧪' },
  { difficulty: 'CFA', price: '₹60', points: 1000, premium: true, emoji: '💰' },
  { difficulty: 'GOD LEVEL', price: '₹100', points: 2000, premium: true, emoji: '🌟' },
];

interface TestCard {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  description: string;
}

interface SubscriptionResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  testMode: boolean;
  testCards: TestCard[] | null;
  plan: string;
  description: string;
}

// Helper to load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject('Razorpay SDK failed to load');
    document.body.appendChild(script);
  });
}

// Set the premium amount in paise (should match backend and Razorpay)
const PREMIUM_AMOUNT = 400; // ₹400 in paise

export default function PremiumPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const isLoaded = status !== 'loading';
  const isSignedIn = status === 'authenticated';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testModeData, setTestModeData] = useState<{
    testMode: boolean;
    testCards: TestCard[] | null;
  } | null>(null);

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/premium/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'premium' }),
      });
      const data: SubscriptionResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to create subscription');
      }
      setTestModeData({
        testMode: data.testMode,
        testCards: data.testCards
      });
      await loadRazorpayScript();
      const options = {
        key: data.key,
        order_id: data.orderId,
        name: 'Quiz Mania',
        description: data.description,
        handler: async function (response: Record<string, string>) {
          try {
            const verifyResponse = await fetch('/api/premium/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok) {
              toast.success('Premium subscription activated successfully!');
              router.push('/profile');
            } else {
              toast.error((verifyData as any).error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
        },
        theme: {
          color: '#6366f1',
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-32">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <span className="inline-block bg-gradient-to-tr from-yellow-400 via-pink-400 to-purple-500 rounded-full p-3 shadow-lg">
              <Crown className="h-12 w-12 text-white drop-shadow-lg" />
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-pink-500 mb-4">
            Quiz Mania Premium
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            🚀 Unlock your full potential with <span className="font-bold text-indigo-600">Premium</span> — more attempts, exclusive quizzes, and advanced features!
          </p>
        </div>

        {/* Test Mode Alert */}
        {testModeData?.testMode && (
          <Alert className="mb-8 max-w-4xl mx-auto">
            <AlertDescription className="flex items-center gap-2">
              <Badge variant="secondary">TEST MODE</Badge>
              <span>You're in test mode. Use the test cards below for payment testing.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Test Cards Section */}
        {testModeData?.testMode && testModeData?.testCards && (
          <Card className="mb-8 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Test Cards for Development
              </CardTitle>
              <CardDescription>
                Use these test cards to simulate different payment scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {testModeData.testCards.map((card, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="font-mono text-sm mb-2">{card.number}</div>
                    <div className="text-xs text-gray-600 mb-1">
                      Name: {card.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      Expiry: {card.expiry} | CVV: {card.cvv}
                    </div>
                    <div className="text-xs font-medium text-blue-600">
                      {card.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Free vs Premium Comparison Tables */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan Table */}
          <div className="rounded-2xl shadow-xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 border-2 border-green-300 dark:border-green-700">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-200 mb-2 flex items-center justify-center gap-2">
                🆓 Free Plan
              </h2>
              <div className="text-3xl font-bold text-green-600 dark:text-green-300 mb-4">₹0</div>
              <ul className="space-y-3 mb-6 text-left max-w-xs mx-auto">
                {freeFeatures.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-green-800 dark:text-green-100">
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <div className="text-xs text-green-700 dark:text-green-200">No credit card required</div>
            </div>
          </div>
          {/* Premium Plan Table */}
          <div className="rounded-2xl shadow-xl bg-gradient-to-br from-yellow-100 to-pink-100 dark:from-yellow-900 dark:to-pink-900 border-2 border-yellow-300 dark:border-yellow-700">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-200 mb-2 flex items-center justify-center gap-2">
                👑 Premium
              </h2>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-300 mb-4">
                ₹{PREMIUM_AMOUNT} <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-6 text-left max-w-xs mx-auto">
                {premiumFeatures.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-yellow-800 dark:text-yellow-100">
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full text-lg py-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-fuchsia-500 text-white font-bold shadow-lg hover:scale-105 transition-transform"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade to Premium 🚀'}
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-300">Quiz Pricing & Points</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg overflow-hidden bg-white dark:bg-slate-800">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800">
                  <th className="px-4 py-2 text-left">Difficulty</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Points</th>
                  <th className="px-4 py-2 text-left">Premium?</th>
                </tr>
              </thead>
              <tbody>
                {quizPricing.map((row, idx) => (
                  <tr key={row.difficulty} className={idx % 2 === 0 ? 'bg-indigo-50 dark:bg-slate-900' : 'bg-pink-50 dark:bg-purple-900'}>
                    <td className="px-4 py-2 font-medium flex items-center gap-2">
                      <span className="text-xl">{row.emoji}</span> {row.difficulty}
                    </td>
                    <td className="px-4 py-2 font-semibold text-indigo-700 dark:text-indigo-300">{row.price}</td>
                    <td className="px-4 py-2 font-semibold text-pink-700 dark:text-pink-300">{row.points}</td>
                    <td className="px-4 py-2">
                      {row.premium ? <Badge className="bg-gradient-to-r from-yellow-400 via-pink-400 to-fuchsia-500 text-white">Premium</Badge> : <span className="text-green-600 font-bold">Free</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-fuchsia-700 dark:text-fuchsia-300">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-700 dark:text-gray-200">Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.</p>
            </div>
            <div className="border rounded-lg p-6 bg-gradient-to-r from-yellow-100 to-pink-100 dark:from-yellow-900 dark:to-pink-900">
              <h3 className="text-lg font-semibold mb-2">What payment methods are accepted?</h3>
              <p className="text-gray-700 dark:text-gray-200">We accept all major credit cards, debit cards, UPI, net banking, and digital wallets through our secure payment partner Razorpay.</p>
            </div>
            <div className="border rounded-lg p-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
              <h3 className="text-lg font-semibold mb-2">Is my payment information secure?</h3>
              <p className="text-gray-700 dark:text-gray-200">Absolutely! We use industry-standard encryption and our payment partner Razorpay is PCI DSS compliant to ensure your data is always secure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 