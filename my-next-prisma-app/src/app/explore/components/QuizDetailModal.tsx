import { motion } from "framer-motion";
import { FiX, FiUsers, FiStar, FiBarChart2, FiMessageCircle, FiAward, FiHeart, FiCheck, FiShoppingCart, FiLoader } from "react-icons/fi";
import { getPricingConfig } from '@/constants/pricing';
import { DifficultyLevel } from '@prisma/client';
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useRouter } from 'next/navigation';

// Define a type for the Razorpay options and the window object
interface RazorpayOptions {
    key: string;
    order_id: string;
    name: string;
    description: string;
    handler: (response: { razorpay_payment_id: string; razorpay_signature: string }) => void;
    theme: {
        color: string;
    };
}

interface RazorpayWindow extends Window {
    Razorpay: new (options: RazorpayOptions) => {
        open: () => void;
    };
}

const sampleQuiz = {
  title: "Advanced Java Programming Challenge",
  tags: ["#Java", "#Advanced", "#Programming", "#Backend"],
  description: "Test your knowledge of advanced Java concepts including multithreading, generics, streams, and the latest features from modern Java versions. This quiz is designed for experienced developers looking to validate their skills.",
  creator: { name: "Akash Singh", avatar: "/default_avatar.png" },
  stats: {
    rating: 4.9,
    reviews: 128,
    attempts: "12k+",
    questions: 25,
    duration: "45 mins",
  },
  comments: [
    { id: 1, user: { name: "Test User 1", avatar: "/default_avatar.png" }, rating: 5, text: "Excellent quiz! Really challenged my understanding of concurrency." },
    { id: 2, user: { name: "Test User 2", avatar: "/default_avatar.png" }, rating: 4, text: "Great questions, but one of the options in Q12 seemed a bit ambiguous. Overall, very good." },
    { id: 3, user: { name: "Test User 3", avatar: "/default_avatar.png" }, rating: 5, text: "This is the best Java quiz I've ever taken. Highly recommended!" },
  ],
};

const DIFFICULTY_LEVELS = [
  { value: 'SUPER_EASY', label: 'Super Easy', color: 'bg-green-500' },
  { value: 'EASY', label: 'Easy', color: 'bg-lime-500' },
  { value: 'NORMAL', label: 'Normal', color: 'bg-blue-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-600' },
  { value: 'HARD', label: 'Hard', color: 'bg-orange-500' },
  { value: 'IMPOSSIBLE', label: 'Impossible', color: 'bg-red-700' },
  { value: 'INSANE', label: 'Insane', color: 'bg-fuchsia-700' },
  { value: 'JEE_ADVANCED', label: 'JEE (Advanced)', color: 'bg-yellow-700' },
  { value: 'JEE_MAIN', label: 'JEE (Main)', color: 'bg-yellow-500' },
  { value: 'NEET_UG', label: 'NEET (UG)', color: 'bg-pink-500' },
  { value: 'UPSC_CSE', label: 'UPSC (CSE)', color: 'bg-gray-700' },
  { value: 'GATE', label: 'GATE', color: 'bg-cyan-700' },
  { value: 'CAT', label: 'CAT', color: 'bg-orange-700' },
  { value: 'CLAT', label: 'CLAT', color: 'bg-indigo-700' },
  { value: 'CA', label: 'CA', color: 'bg-amber-700' },
  { value: 'GAOKAO', label: 'GAOKAO', color: 'bg-red-500' },
  { value: 'GRE', label: 'GRE', color: 'bg-blue-700' },
  { value: 'GMAT', label: 'GMAT', color: 'bg-purple-700' },
  { value: 'USMLE', label: 'USMLE', color: 'bg-teal-700' },
  { value: 'LNAT', label: 'LNAT', color: 'bg-gray-500' },
  { value: 'MCAT', label: 'MCAT', color: 'bg-emerald-700' },
  { value: 'CFA', label: 'CFA', color: 'bg-green-700' },
  { value: 'GOD_LEVEL', label: 'GOD LEVEL', color: 'bg-black' },
];

type QuizDetailModalProps = {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    tags: string[];
    imageUrl: string | null;
    rating: number;
    likeCount: number;
    usersTaken: number;
    createdAt: string;
    price: number;
    field: string | null;
    subject: string | null;
    creator: {
      name: string | null;
      avatarUrl: string | null;
    } | null;
    durationInSeconds?: number;
    isLocked?: boolean;
    difficultyLevel?: string;
    pricePerAttempt?: number;
    pointPerAttempt?: number;
  };
  onClose: () => void;
  isPremiumUser?: boolean;
  isUnlocked?: boolean;
  onUnlockUpdate: () => void;
};

export default function QuizDetailModal({ quiz, onClose, isPremiumUser = false, isUnlocked = false, onUnlockUpdate }: QuizDetailModalProps) {
  const [isBuying, setIsBuying] = useState(false);
  const isPremium = quiz.difficultyLevel && getPricingConfig(quiz.difficultyLevel as DifficultyLevel).requiresPremium;
  const pricingConfig = quiz.difficultyLevel ? getPricingConfig(quiz.difficultyLevel as DifficultyLevel) : null;
  const isPaidQuiz = pricingConfig && pricingConfig.pricePerAttempt > 0;
  const router = useRouter();

  const handlePurchase = async () => {
    setIsBuying(true);
    try {
      // 1. Create Order
      const purchaseRes = await fetch('/api/quizzes/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id }),
      });
      const purchaseData = await purchaseRes.json();
      if (!purchaseRes.ok) throw new Error(purchaseData.error || 'Failed to create purchase order.');
      
      // 2. Load Razorpay and open checkout
      await loadRazorpayScript();
      const options = {
        key: purchaseData.key,
        order_id: purchaseData.orderId,
        name: 'Quiz Mania',
        description: purchaseData.description,
        handler: async function (response: Record<string, string>) {
          try {
            const verifyRes = await fetch('/api/quizzes/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: purchaseData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success('Quiz purchased successfully! You can now attempt it.');
              onUnlockUpdate(); // This will trigger a re-fetch of unlocked quizzes
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error instanceof Error ? error.message : 'Payment verification failed');
          }
        },
        theme: { color: '#6366f1' },
      };
      const rzp = new (window as RazorpayWindow).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start purchase.');
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Main Modal Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-6xl h-[90vh] bg-white text-gray-900 dark:bg-[#10111a] dark:text-white border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
        {/* Left Panel - Details & Comments */}
        <div className="md:w-3/5 w-full flex flex-col p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-[#10111a]">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-extrabold futuristic-title bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-400 dark:from-purple-400 dark:via-blue-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient-move">
                {quiz.title}
              </h1>
              {/* Premium Badge */}
              {isPremium && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FiAward className="w-4 h-4" />
                  Premium
                </div>
              )}
              {/* Unlocked Badge */}
              {isPremiumUser && isUnlocked && isPaidQuiz && (
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FiCheck className="w-4 h-4" />
                  Unlocked
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map(tag => (
                <span key={tag} className="futuristic-badge bg-blue-50 text-blue-900 dark:bg-white/10 dark:text-white/80 px-3 py-1 text-xs rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold text-fuchsia-500 dark:text-fuchsia-300 mb-2">Description</h3>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{quiz.description || 'No description available.'}</p>
          </div>

          {/* Premium User Info */}
          {isPremiumUser && isPaidQuiz && !isUnlocked && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <FiAward className="w-5 h-5" />
                <span className="font-semibold">Premium Benefit</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Your first attempt on this quiz is free! After that, you&apos;ll have unlimited access during your premium subscription.
              </p>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4"><FiMessageCircle className="text-blue-500 dark:text-blue-400" /> User Feedback</h2>
            <div className="flex flex-col gap-4">
              {sampleQuiz.comments.map(comment => (
                <div key={comment.id} className="bg-blue-100 border border-blue-200 text-blue-900 dark:bg-white/5 dark:border-white/10 dark:text-white p-4 rounded-xl flex gap-4">
                  <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{comment.user.name}</div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(comment.rating)].map((_, i) => <FiStar key={i} fill="currentColor" />)}
                      {[...Array(5 - comment.rating)].map((_, i) => <FiStar key={i} />)}
                    </div>
                    <p className="text-gray-600 dark:text-white/70 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Cover Image & Stats */}
        <div className="md:w-2/5 w-full bg-white dark:bg-[#181a1f] p-6 md:p-8 flex flex-col gap-6 justify-between">
          {/* Cover Image */}
          {quiz.imageUrl ? (
            <div className="w-full aspect-[16/9] mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <img
                src={quiz.imageUrl}
                alt={quiz.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#23234d] to-[#181a2a] rounded-2xl flex items-center justify-center text-5xl font-bold text-gray-300 dark:text-white/50 mb-6 shadow-lg">
              IMG
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {quiz.creator?.avatarUrl ? (
                <img src={quiz.creator.avatarUrl} alt={quiz.creator.name || 'Creator'} className="w-12 h-12 rounded-full border-2 border-fuchsia-400" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-fuchsia-400" />
              )}
              <div>
                <div className="text-gray-600 dark:text-white/70 text-sm">Created by</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{quiz.creator?.name || 'Anonymous'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><FiBarChart2 className="text-yellow-400" /> <div><strong className="text-gray-900 dark:text-white">{quiz.rating.toFixed(1)}</strong></div></div>
              <div className="flex items-center gap-2"><FiHeart className="text-red-400" /> <div><strong className="text-gray-900 dark:text-white">{quiz.likeCount}</strong></div></div>
              <div className="flex items-center gap-2"><FiUsers className="text-green-400" /> <div><strong className="text-gray-900 dark:text-white">{quiz.usersTaken}</strong></div></div>
              <div className="flex items-center gap-2"><FiAward className="text-pink-400" /> <div><strong className="text-gray-900 dark:text-white">
                {pricingConfig ? (
                  pricingConfig.pricePerAttempt === 0 
                    ? 'Free' 
                    : isPremiumUser && isUnlocked
                    ? 'Free (Unlocked)'
                    : `₹${pricingConfig.pricePerAttempt}`
                ) : quiz.price === 0 ? 'Free' : `₹${quiz.price}`}
              </strong></div></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-800 dark:text-white">
                <span className="font-semibold">Time Limit:</span> {(quiz.durationInSeconds ?? 0) === 0 ? 'Unlimited' : `${Math.floor((quiz.durationInSeconds ?? 0)/60)} min${(quiz.durationInSeconds ?? 0)%60 ? ' ' + (quiz.durationInSeconds ?? 0)%60 + ' sec' : ''}`}
              </div>
              <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-800 dark:text-white">
                <span className="font-semibold">Locked:</span> {quiz.isLocked ? 'Yes' : 'No'}
              </div>
              {quiz.difficultyLevel && (
                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-semibold ${DIFFICULTY_LEVELS.find(d => d.value === quiz.difficultyLevel)?.color || 'bg-slate-700'} text-white`}>
                  {DIFFICULTY_LEVELS.find(d => d.value === quiz.difficultyLevel)?.label || quiz.difficultyLevel}
                </span>
              )}
              {pricingConfig && pricingConfig.pointPerAttempt > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-500 text-white">
                  <FiAward className="w-3 h-3" />
                  {pricingConfig.pointPerAttempt} pts
                </span>
              )}
            </div>
          </div>
          {isPaidQuiz && !isUnlocked && !isPremiumUser ? (
             <button
              onClick={handlePurchase}
              disabled={isBuying}
              className="w-full futuristic-button bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 rounded-xl text-xl hover:scale-105 transition-transform duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isBuying ? (
                <>
                  <FiLoader className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <FiShoppingCart /> Buy Quiz (₹{pricingConfig.pricePerAttempt})
                </>
              )}
            </button>
          ) : (
            <button
              className="w-full futuristic-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl text-xl hover:scale-105 transition-transform duration-300 shadow-lg"
              onClick={() => router.push(`/quiz/${quiz.id}/take`)}
            >
              ▶️ Attempt Quiz
            </button>
          )}
        </div>
      </motion.div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 text-white/70 hover:text-white hover:scale-110 transition-transform"
        aria-label="Close"
      >
        <FiX size={32} />
      </button>
    </div>
  );
}

// Helper to load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as RazorpayWindow).Razorpay) {
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