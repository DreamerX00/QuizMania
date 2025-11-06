import {
  FiHeart,
  FiMessageCircle,
  FiStar,
  FiZap,
  FiLock,
  FiAward,
  FiCheck,
} from "react-icons/fi";
import { getPricingConfig } from "@/constants/pricing";
import Image from "next/image";

const DIFFICULTY_LEVELS = [
  { value: "SUPER_EASY", label: "Super Easy", color: "bg-green-500" },
  { value: "EASY", label: "Easy", color: "bg-lime-500" },
  { value: "NORMAL", label: "Normal", color: "bg-blue-400" },
  { value: "MEDIUM", label: "Medium", color: "bg-blue-600" },
  { value: "HARD", label: "Hard", color: "bg-orange-500" },
  { value: "IMPOSSIBLE", label: "Impossible", color: "bg-red-700" },
  { value: "INSANE", label: "Insane", color: "bg-fuchsia-700" },
  { value: "JEE_ADVANCED", label: "JEE (Advanced)", color: "bg-yellow-700" },
  { value: "JEE_MAIN", label: "JEE (Main)", color: "bg-yellow-500" },
  { value: "NEET_UG", label: "NEET (UG)", color: "bg-pink-500" },
  { value: "UPSC_CSE", label: "UPSC (CSE)", color: "bg-gray-700" },
  { value: "GATE", label: "GATE", color: "bg-cyan-700" },
  { value: "CAT", label: "CAT", color: "bg-orange-700" },
  { value: "CLAT", label: "CLAT", color: "bg-indigo-700" },
  { value: "CA", label: "CA", color: "bg-amber-700" },
  { value: "GAOKAO", label: "GAOKAO", color: "bg-red-500" },
  { value: "GRE", label: "GRE", color: "bg-blue-700" },
  { value: "GMAT", label: "GMAT", color: "bg-purple-700" },
  { value: "USMLE", label: "USMLE", color: "bg-teal-700" },
  { value: "LNAT", label: "LNAT", color: "bg-gray-500" },
  { value: "MCAT", label: "MCAT", color: "bg-emerald-700" },
  { value: "CFA", label: "CFA", color: "bg-green-700" },
  { value: "GOD_LEVEL", label: "GOD LEVEL", color: "bg-black" },
];

type QuizCardProps = {
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
    creator: {
      name: string | null;
      avatarUrl: string | null;
    } | null;
    durationInSeconds?: number;
    isLocked?: boolean;
    difficultyLevel?: string;
    pricePerAttempt?: number;
    pointPerAttempt?: number;
    slug?: string; // Added slug to the type
  };
  onClick: (quiz: QuizCardProps["quiz"]) => void;
  isUnlocked?: boolean;
  isPremiumUser?: boolean;
};

export default function QuizCard({
  quiz,
  onClick,
  isUnlocked = false,
  isPremiumUser = false,
}: QuizCardProps) {
  const isPremium =
    quiz.difficultyLevel &&
    getPricingConfig(quiz.difficultyLevel as any).requiresPremium;
  const pricingConfig = quiz.difficultyLevel
    ? getPricingConfig(quiz.difficultyLevel as any)
    : null;
  const isPaidQuiz = pricingConfig && pricingConfig.pricePerAttempt > 0;

  return (
    <div
      onClick={() => onClick?.(quiz)}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-slate-700 group"
    >
      {/* Image */}
      <div className="relative mb-4">
        {/* Thumbnail */}
        <div className="aspect-video overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-800">
          {quiz.imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={quiz.imageUrl}
                alt={quiz.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-purple-500 dark:text-purple-400">
              QZ
            </div>
          )}
        </div>

        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FiAward className="w-3 h-3" />
            Premium
          </div>
        )}

        {/* Unlocked Badge for Premium Users */}
        {isPremiumUser && isUnlocked && isPaidQuiz && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FiCheck className="w-3 h-3" />
            Unlocked
          </div>
        )}

        {/* Lock Badge */}
        {quiz.isLocked && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FiLock className="w-3 h-3" />
            Locked
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {quiz.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {quiz.description || "No description available"}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {quiz.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {quiz.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{quiz.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Difficulty and Pricing */}
        <div className="flex flex-wrap gap-2">
          {quiz.difficultyLevel && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                DIFFICULTY_LEVELS.find((d) => d.value === quiz.difficultyLevel)
                  ?.color || "bg-slate-700"
              } text-white`}
            >
              {DIFFICULTY_LEVELS.find((d) => d.value === quiz.difficultyLevel)
                ?.label || quiz.difficultyLevel}
            </span>
          )}

          {/* Pricing Badge */}
          {pricingConfig && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                pricingConfig.pricePerAttempt === 0
                  ? "bg-green-500 text-white"
                  : isPremiumUser && isUnlocked
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {pricingConfig.pricePerAttempt === 0
                ? "Free"
                : isPremiumUser && isUnlocked
                ? "Free (Unlocked)"
                : `₹${pricingConfig.pricePerAttempt}`}
            </span>
          )}

          {/* Points Badge */}
          {pricingConfig && pricingConfig.pointPerAttempt > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-yellow-500 text-white">
              <FiZap className="w-3 h-3" />
              {pricingConfig.pointPerAttempt} pts
            </span>
          )}
        </div>

        {/* Premium User Info */}
        {isPremiumUser && isPaidQuiz && !isUnlocked && (
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
            First attempt free with Premium
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4 text-yellow-500" />
              <span>{quiz.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiHeart className="w-4 h-4 text-red-500" />
              <span>{quiz.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiMessageCircle className="w-4 h-4 text-blue-500" />
              <span>{quiz.usersTaken}</span>
            </div>
          </div>

          {/* Duration */}
          {quiz.durationInSeconds && quiz.durationInSeconds > 0 && (
            <div className="text-xs">
              {Math.floor(quiz.durationInSeconds / 60)}m
            </div>
          )}
        </div>

        {/* Creator */}
        {quiz.creator && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
              {quiz.creator.avatarUrl ? (
                <Image
                  src={quiz.creator.avatarUrl}
                  alt=""
                  fill
                  className="rounded-full object-cover"
                  sizes="24px"
                />
              ) : (
                quiz.creator.name?.charAt(0) || "U"
              )}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {quiz.creator.name || "Anonymous"}
            </span>
          </div>
        )}
      </div>
      <a
        href={quiz.slug ? `/quiz/${quiz.slug}/take` : `/quiz/${quiz.id}/take`}
        className="block mt-4 text-blue-500 hover:underline text-center"
      >
        Take Quiz
      </a>
    </div>
  );
}
