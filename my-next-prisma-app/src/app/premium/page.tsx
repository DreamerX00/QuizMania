"use client";
import React, { useState, useEffect } from "react";
import {
  Crown,
  Zap,
  Sparkles,
  Brain,
  Rocket,
  Shield,
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  Infinity as InfinityIcon,
  Gift,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

// Animation variants for consistent, professional animations
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

// Razorpay Type Definitions
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    userId?: string;
    type: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const freeFeatures = [
  {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    text: "50+ curated standard quizzes",
    description: "High-quality content to get you started",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    text: "3 quiz attempts daily",
    description: "Perfect for casual learners",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    text: "Essential analytics",
    description: "Track your progress and performance",
  },
  {
    icon: <XCircle className="w-5 h-5 text-gray-400" />,
    text: "AI quiz generation",
    description: "Upgrade to unlock AI-powered content",
  },
  {
    icon: <XCircle className="w-5 h-5 text-gray-400" />,
    text: "Premium content library",
    description: "Access exclusive exam prep materials",
  },
  {
    icon: <XCircle className="w-5 h-5 text-gray-400" />,
    text: "Advanced AI models",
    description: "Get access to GPT-4, Claude Opus & more",
  },
];

const premiumFeatures = [
  {
    icon: <Crown className="w-5 h-5 text-blue-600" />,
    text: "Everything in Free",
    description: "Plus exclusive premium benefits",
    highlight: false,
  },
  {
    icon: <Target className="w-5 h-5 text-blue-600" />,
    text: "Unlimited premium quiz library",
    description: "Access 1000+ curated quizzes across all categories",
    highlight: true,
  },
  {
    icon: <Brain className="w-5 h-5 text-blue-600" />,
    text: "5 AI generations daily",
    description: "Create custom quizzes with GPT-4o Mini & Claude Sonnet",
    highlight: true,
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
    text: "Elite exam preparation",
    description: "JEE, NEET, UPSC, GRE, GMAT & 20+ competitive exams",
    highlight: false,
  },
  {
    icon: <InfinityIcon className="w-5 h-5 text-blue-600" />,
    text: "10 daily attempts per quiz",
    description: "Master topics through repetition",
    highlight: false,
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
    text: "Advanced performance analytics",
    description: "Detailed insights with AI-powered recommendations",
    highlight: false,
  },
  {
    icon: <Shield className="w-5 h-5 text-blue-600" />,
    text: "Priority support",
    description: "Get help when you need it most",
    highlight: false,
  },
];

const premiumPlusFeatures = [
  {
    icon: <Crown className="w-5 h-5 text-purple-600" />,
    text: "Everything in Premium",
    description: "Plus unlimited AI power and exclusive perks",
    highlight: true,
  },
  {
    icon: <InfinityIcon className="w-5 h-5 text-purple-600" />,
    text: "UNLIMITED AI generations",
    description: "Create infinite custom quizzes with no daily limits",
    highlight: true,
  },
  {
    icon: <Brain className="w-5 h-5 text-purple-600" />,
    text: "All 8 premium AI models",
    description: "GPT-4o, Claude Opus, Gemini Pro & 5 more",
    highlight: true,
  },
  {
    icon: <InfinityIcon className="w-5 h-5 text-purple-600" />,
    text: "Unlimited quiz attempts",
    description: "Practice without boundaries, master every topic",
    highlight: false,
  },
  {
    icon: <Rocket className="w-5 h-5 text-purple-600" />,
    text: "10x XP multiplier",
    description: "Level up faster and unlock achievements",
    highlight: false,
  },
  {
    icon: <Palette className="w-5 h-5 text-purple-600" />,
    text: "Custom quiz templates & themes",
    description: "Personalize your entire learning experience",
    highlight: false,
  },
  {
    icon: <Gift className="w-5 h-5 text-purple-600" />,
    text: "Exclusive beta features",
    description: "First access to cutting-edge tools and updates",
    highlight: false,
  },
  {
    icon: <Shield className="w-5 h-5 text-purple-600" />,
    text: "VIP priority support",
    description: "Dedicated assistance with 2-hour response time",
    highlight: false,
  },
];

const aiModels = [
  {
    name: "GPT-4o",
    provider: "OpenAI",
    tier: "Premium Plus Only",
    color: "from-green-400 to-emerald-600",
    description: "Most capable model for complex topics",
  },
  {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    tier: "Premium (5/day)",
    color: "from-blue-400 to-cyan-600",
    description: "Fast and efficient for quick quizzes",
  },
  {
    name: "Claude Opus",
    provider: "Anthropic",
    tier: "Premium Plus Only",
    color: "from-purple-400 to-fuchsia-600",
    description: "Best for reasoning and analysis",
  },
  {
    name: "Claude Sonnet",
    provider: "Anthropic",
    tier: "Premium (5/day)",
    color: "from-indigo-400 to-purple-600",
    description: "Balanced performance and speed",
  },
  {
    name: "Claude Haiku",
    provider: "Anthropic",
    tier: "Premium (5/day)",
    color: "from-violet-400 to-indigo-600",
    description: "Fastest model for instant generation",
  },
  {
    name: "Gemini Pro",
    provider: "Google",
    tier: "Premium Plus Only",
    color: "from-red-400 to-orange-600",
    description: "Advanced multimodal capabilities",
  },
  {
    name: "Gemini Flash",
    provider: "Google",
    tier: "Premium (5/day)",
    color: "from-amber-400 to-yellow-600",
    description: "Lightning-fast quiz generation",
  },
  {
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    tier: "Premium (5/day)",
    color: "from-gray-400 to-slate-600",
    description: "Basic quiz generation",
  },
];

// Premium tier pricing (Access to premium quizzes + 5 AI generations/day)
const premiumPricing = [
  {
    name: "Monthly",
    price: 299,
    duration: "month",
    savings: null,
    badge: null,
  },
  {
    name: "Quarterly",
    price: 799,
    duration: "3 months",
    savings: "₹98 (11% off)",
    badge: "Most Popular",
  },
  {
    name: "Yearly",
    price: 2999,
    duration: "year",
    savings: "₹589 (16% off)",
    badge: "Best Value",
  },
];

// Premium Plus tier pricing (Everything + unlimited AI generation)
const premiumPlusPricing = [
  {
    name: "Monthly",
    price: 499,
    duration: "month",
    savings: null,
    badge: null,
  },
  {
    name: "Quarterly",
    price: 1299,
    duration: "3 months",
    savings: "₹198 (13% off)",
    badge: "Most Popular",
  },
  {
    name: "Yearly",
    price: 4499,
    duration: "year",
    savings: "₹1489 (25% off)",
    badge: "Best Value",
  },
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
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject("Razorpay SDK failed to load");
    document.body.appendChild(script);
  });
}

export default function PremiumPage() {
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"premium" | "premium-plus">(
    "premium-plus"
  );
  const [selectedDuration, setSelectedDuration] = useState("Quarterly");
  const [testModeData, setTestModeData] = useState<{
    testMode: boolean;
    testCards: TestCard[] | null;
  } | null>(null);

  const highlightedFeature = searchParams?.get("feature");

  useEffect(() => {
    if (highlightedFeature === "ai-quiz-generation") {
      const element = document.getElementById("ai-features");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-4", "ring-purple-500", "ring-opacity-50");
          setTimeout(() => {
            element.classList.remove(
              "ring-4",
              "ring-purple-500",
              "ring-opacity-50"
            );
          }, 3000);
        }, 500);
      }
    }
  }, [highlightedFeature]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/signin?callbackUrl=/premium");
    return null;
  }

  // Get current pricing based on selected tier and duration
  const currentPricing =
    selectedTier === "premium" ? premiumPricing : premiumPlusPricing;
  const selectedPlanData =
    currentPricing.find((p) => p.name === selectedDuration) ||
    currentPricing[1];

  if (!selectedPlanData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pricing data not available</p>
      </div>
    );
  }

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/premium/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: selectedTier, // "premium" or "premium-plus"
          duration: selectedDuration.toLowerCase(), // "monthly", "quarterly", "yearly"
          amount: selectedPlanData.price * 100, // Convert to paise
        }),
      });

      const data: SubscriptionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.description || "Failed to create subscription");
      }

      setTestModeData({
        testMode: data.testMode,
        testCards: data.testCards,
      });

      await loadRazorpayScript();

      const options: RazorpayOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Quiz Mania Premium",
        description: data.description,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          contact: "",
        },
        notes: {
          userId: session?.user?.id,
          type: "premium_subscription",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
        handler: async function (response: RazorpayResponse) {
          try {
            const verifyResponse = await fetch("/api/premium/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: data.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast.success("🎉 Premium activated! Welcome to the elite club!");
              router.push("/profile?premium=activated");
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-32">
        {/* Hero Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center mb-20"
        >
          <motion.div variants={scaleIn} className="flex justify-center mb-8">
            <motion.div
              animate={{
                rotate: [0, 12, -12, 0],
                scale: [1, 1.05, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              className="inline-block bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full p-4 shadow-2xl"
            >
              <Crown className="h-12 w-12 md:h-16 md:w-16 text-white drop-shadow-2xl" />
            </motion.div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 mb-5 leading-tight"
          >
            Upgrade Your Learning
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto mb-5 font-medium"
          >
            Choose the perfect plan for your quiz journey
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 space-y-2"
          >
            <p className="leading-relaxed">
              <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400">
                <Zap className="w-4 h-4 mr-1.5" />
                Premium
              </span>
              : Unlock all premium quizzes + 5 AI generations daily
            </p>
            <p className="leading-relaxed">
              <span className="inline-flex items-center font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Premium Plus
              </span>
              : Everything in Premium + UNLIMITED AI quiz generation
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-2"
          >
            <motion.div variants={scaleIn}>
              <Badge
                variant="secondary"
                className="text-xs px-4 py-2 hover:scale-105 transition-transform cursor-default shadow-md"
              >
                <Target className="w-3.5 h-3.5 mr-1.5" />
                1000+ Premium Quizzes
              </Badge>
            </motion.div>
            <motion.div variants={scaleIn}>
              <Badge
                variant="secondary"
                className="text-xs px-4 py-2 hover:scale-105 transition-transform cursor-default shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AI Quiz Generation
              </Badge>
            </motion.div>
            <motion.div variants={scaleIn}>
              <Badge
                variant="secondary"
                className="text-xs px-4 py-2 hover:scale-105 transition-transform cursor-default shadow-md"
              >
                <Brain className="w-3.5 h-3.5 mr-1.5" />8 Premium AI Models
              </Badge>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Test Mode Alert */}
        {testModeData?.testMode && (
          <Alert className="mb-8 max-w-4xl mx-auto">
            <AlertDescription className="flex items-center gap-2">
              <Badge variant="secondary">TEST MODE</Badge>
              <span>
                You&apos;re in test mode. Use the test cards below for payment
                testing.
              </span>
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

        {/* AI Models Section */}
        <motion.section
          id="ai-features"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-4xl font-bold text-center mb-3 text-indigo-700 dark:text-indigo-300"
          >
            <span className="inline-flex items-center gap-2">
              <Brain className="w-6 h-6 md:w-8 md:h-8" />8 Premium AI Models
            </span>
          </motion.h2>

          <motion.div
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-10 space-y-1.5"
          >
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Premium
              </span>
              : 5 daily generations with GPT-4o Mini, Claude Sonnet, Gemini
              Flash
            </p>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Premium Plus
              </span>
              : UNLIMITED access to GPT-4o, Claude Opus, Gemini Pro & all models
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Generate personalized quizzes with the world&apos;s most advanced
              AI technology
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {aiModels.map((model) => (
              <motion.div
                key={model.name}
                variants={scaleIn}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`h-full ${
                    model.tier.includes("Plus Only")
                      ? "border-2 border-purple-400 dark:border-purple-600"
                      : model.tier.includes("Premium")
                      ? "border-2 border-blue-400 dark:border-blue-600"
                      : "border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      {model.tier.includes("Plus Only") ? (
                        <Sparkles className="w-5 h-5 text-purple-500" />
                      ) : model.tier.includes("Premium") ? (
                        <Crown className="w-5 h-5 text-blue-500" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`bg-linear-to-r ${model.color} text-white border-0`}
                      >
                        {model.provider}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          model.tier.includes("Plus Only")
                            ? "border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400"
                            : model.tier.includes("Premium")
                            ? "border-blue-400 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                            : ""
                        }`}
                      >
                        {model.tier}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {model.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Pricing Plans */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20 max-w-6xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-4xl font-bold text-center mb-10 text-indigo-700 dark:text-indigo-300"
          >
            Choose Your Perfect Plan
          </motion.h2>

          {/* Tier Selector */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-3 mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTier("premium")}
              className={`px-6 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
                selectedTier === "premium"
                  ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-2xl ring-4 ring-blue-300 dark:ring-blue-700"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-lg font-extrabold">Premium</div>
                  <div className="text-xs mt-0.5 opacity-90 font-normal">
                    5 AI/day • All Premium Quizzes
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTier("premium-plus")}
              className={`px-6 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
                selectedTier === "premium-plus"
                  ? "bg-linear-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-2xl ring-4 ring-purple-300 dark:ring-purple-700"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-lg font-extrabold">Premium Plus</div>
                  <div className="text-xs mt-0.5 opacity-90 font-normal">
                    Unlimited AI • All Features
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Duration Selector */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {currentPricing.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDuration(plan.name)}
                className={`relative cursor-pointer rounded-2xl p-6 transition-all ${
                  selectedDuration === plan.name
                    ? selectedTier === "premium"
                      ? "bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 ring-4 ring-blue-500"
                      : "bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 ring-4 ring-purple-500"
                    : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-yellow-400 to-orange-500 text-white">
                    {plan.badge}
                  </Badge>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div
                    className={`text-4xl font-extrabold mb-2 ${
                      selectedTier === "premium"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    ₹{plan.price}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    per {plan.duration}
                  </div>

                  {plan.savings && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      Save {plan.savings}
                    </Badge>
                  )}

                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    ≈ ₹
                    {Math.round(
                      plan.price /
                        (plan.name === "Yearly"
                          ? 12
                          : plan.name === "Quarterly"
                          ? 3
                          : 1)
                    )}
                    /month
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className={`text-xl px-12 py-6 text-white font-bold shadow-2xl hover:scale-105 transition-all ${
                selectedTier === "premium"
                  ? "bg-linear-to-r from-blue-600 via-cyan-600 to-teal-600 hover:shadow-blue-500/50"
                  : "bg-linear-to-r from-purple-600 via-pink-600 to-red-600 hover:shadow-purple-500/50"
              }`}
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Upgrade to{" "}
                  {selectedTier === "premium" ? "Premium" : "Premium Plus"} - ₹
                  {selectedPlanData.price}
                </span>
              )}
            </Button>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Cancel anytime • Secure payment via Razorpay • 7-day money-back
              guarantee
            </p>
          </div>
        </motion.section>

        {/* Features Comparison */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto mb-20"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-4xl font-bold text-center mb-10 text-indigo-700 dark:text-indigo-300"
          >
            Compare All Plans
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Free Plan */}
            <motion.div
              variants={slideInLeft}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <Card className="h-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="text-center bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 py-4">
                  <CardTitle className="text-lg flex items-center justify-center gap-2">
                    🆓 Free
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1.5">
                    ₹0
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <ul className="space-y-3">
                    {freeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className="mt-0.5">{feature.icon}</div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                            {feature.text}
                          </div>
                          {feature.description && (
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-2 border-blue-500 dark:border-blue-600 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="text-center bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 py-4">
                  <CardTitle className="text-lg flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4 text-blue-600" />
                    Premium
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1.5">
                    From ₹
                    {Math.min(
                      ...premiumPricing.map((p) =>
                        Math.round(
                          p.price /
                            (p.name === "Yearly"
                              ? 12
                              : p.name === "Quarterly"
                              ? 3
                              : 1)
                        )
                      )
                    )}
                    /mo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <ul className="space-y-3">
                    {premiumFeatures.map((feature, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-2.5 ${
                          feature.highlight
                            ? "bg-blue-50 dark:bg-blue-900/20 -mx-1.5 px-1.5 py-1.5 rounded-lg"
                            : ""
                        }`}
                      >
                        <div className="mt-0.5">{feature.icon}</div>
                        <div className="flex-1">
                          <div
                            className={`text-xs font-semibold ${
                              feature.highlight
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {feature.text}
                          </div>
                          {feature.description && (
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plus Plan */}
            <motion.div
              variants={slideInRight}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-3 border-purple-500 dark:border-purple-600 relative overflow-hidden shadow-2xl hover:shadow-purple-500/50 transition-all duration-300">
                <div className="absolute top-0 right-0 bg-linear-to-br from-purple-400 via-pink-400 to-red-400 text-white px-3 py-0.5 text-[10px] font-bold transform rotate-45 translate-x-6 translate-y-1.5">
                  UNLIMITED AI
                </div>
                <CardHeader className="text-center bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 py-4">
                  <CardTitle className="text-lg flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Premium Plus
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1.5">
                    From ₹
                    {Math.min(
                      ...premiumPlusPricing.map((p) =>
                        Math.round(
                          p.price /
                            (p.name === "Yearly"
                              ? 12
                              : p.name === "Quarterly"
                              ? 3
                              : 1)
                        )
                      )
                    )}
                    /mo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <ul className="space-y-3">
                    {premiumPlusFeatures.map((feature, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-2.5 ${
                          feature.highlight
                            ? "bg-purple-50 dark:bg-purple-900/20 -mx-1.5 px-1.5 py-1.5 rounded-lg border-l-2 border-purple-500"
                            : ""
                        }`}
                      >
                        <div className="mt-0.5">{feature.icon}</div>
                        <div className="flex-1">
                          <div
                            className={`text-xs font-semibold ${
                              feature.highlight
                                ? "text-purple-700 dark:text-purple-300"
                                : "text-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {feature.text}
                          </div>
                          {feature.description && (
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Continue with existing FAQ section below...</ */}
        {/* Free vs Premium Comparison Tables (OLD - will be replaced) */}
        <div
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16"
          style={{ display: "none" }}
        >
          {/* Free Plan Table */}
          <div className="rounded-2xl shadow-xl bg-linear-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 border-2 border-green-300 dark:border-green-700">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-200 mb-2 flex items-center justify-center gap-2">
                🆓 Free Plan
              </h2>
              <div className="text-3xl font-bold text-green-600 dark:text-green-300 mb-4">
                ₹0
              </div>
              <ul className="space-y-3 mb-6 text-left max-w-xs mx-auto">
                {freeFeatures.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-green-800 dark:text-green-100"
                  >
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <div className="text-xs text-green-700 dark:text-green-200">
                No credit card required
              </div>
            </div>
          </div>
          {/* Premium Plan Table */}
          <div className="rounded-2xl shadow-xl bg-linear-to-br from-yellow-100 to-pink-100 dark:from-yellow-900 dark:to-pink-900 border-2 border-yellow-300 dark:border-yellow-700">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-200 mb-2 flex items-center justify-center gap-2">
                👑 Premium
              </h2>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-300 mb-4">
                ₹400{" "}
                <span className="text-lg font-normal text-gray-500">
                  /month
                </span>
              </div>
              <ul className="space-y-3 mb-6 text-left max-w-xs mx-auto">
                {premiumFeatures.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-yellow-800 dark:text-yellow-100"
                  >
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full text-lg py-3 bg-linear-to-r from-yellow-400 via-pink-400 to-fuchsia-500 text-white font-bold shadow-lg hover:scale-105 transition-transform"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Processing..." : "Upgrade to Premium 🚀"}
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-4xl font-bold text-center mb-10 text-purple-700 dark:text-purple-300"
          >
            <span className="inline-flex items-center gap-2.5">
              <Target className="w-7 h-7" />
              Frequently Asked Questions
            </span>
          </motion.h2>
          <motion.div variants={staggerContainer} className="space-y-5">
            <motion.div variants={fadeInUp}>
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">
                    What&apos;s the difference between Premium and Premium Plus?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>
                      Premium (₹{premiumPricing[0]?.price || 99}/mo)
                    </strong>
                    : Get access to all premium explore quizzes, exam prep, and
                    5 AI quiz generations per day using basic AI models (GPT-4o
                    Mini, Claude Sonnet, Gemini Flash, GPT-3.5).
                    <br />
                    <br />
                    <strong>
                      Premium Plus (₹{premiumPlusPricing[0]?.price || 249}/mo)
                    </strong>
                    : Everything in Premium PLUS unlimited AI quiz generation
                    with all 8 AI models including GPT-4, Claude Opus, and
                    Gemini Pro. Perfect for power users!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Can I cancel my subscription anytime?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Yes! You can cancel your subscription at any time. Your
                    premium access will continue until the end of your current
                    billing period. We also offer a 7-day money-back guarantee
                    if you&apos;re not satisfied.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">
                    What payment methods are accepted?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    We accept all major credit cards, debit cards, UPI, net
                    banking, and digital wallets through our secure payment
                    partner Razorpay. All transactions are encrypted and PCI DSS
                    compliant.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Which AI model should I choose?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    • <strong>GPT-4o</strong>: Best for complex topics and
                    detailed explanations
                    <br />• <strong>Claude Opus</strong>: Excellent for
                    reasoning and analytical questions
                    <br />• <strong>Gemini Pro</strong>: Great for creative and
                    multimodal content
                    <br />• <strong>GPT-4o Mini/Sonnet</strong>: Fast generation
                    for quick quizzes
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Do I get access to premium exam prep quizzes?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Yes! Premium includes unlimited access to all exam
                    preparation quizzes including JEE, NEET, UPSC, GATE, CAT,
                    GRE, GMAT, USMLE, and more. Plus, you can generate custom
                    practice quizzes for any exam using AI.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          variants={scaleIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-20 mb-10 text-center bg-linear-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl p-10 md:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>

          <motion.div variants={fadeInUp} className="relative z-10">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="inline-block mb-5"
            >
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 drop-shadow-2xl" />
            </motion.div>

            <h2 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
              Ready to Supercharge Your Learning?
            </h2>
            <p className="text-base md:text-xl mb-8 opacity-95 max-w-3xl mx-auto font-medium">
              Join thousands of students mastering their subjects with
              AI-powered quizzes.
              <span className="block mt-1.5 text-yellow-300">
                Start your journey to success today!
              </span>
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-10 py-6 bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-700 font-bold shadow-2xl hover:shadow-purple-900/50 transition-all duration-300"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <Crown className="w-6 h-6" />
                    Start Your Premium Journey Today
                  </span>
                )}
              </Button>
            </motion.div>

            <p className="mt-5 text-xs text-white/80">
              ✓ Cancel anytime • ✓ Secure payment • ✓ 7-day money-back guarantee
            </p>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
