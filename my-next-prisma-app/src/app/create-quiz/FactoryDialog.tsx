"use client";
import React, { useState, useRef, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import type {
  Quiz,
  QuizComment as PrismaQuizComment,
  QuizPackage,
} from "@prisma/client";
import { Slider } from "@/components/ui/slider";

// Extended types for runtime data (Quiz already has durationInSeconds, isLocked, difficultyLevel in Prisma)

interface CommentWithUser extends PrismaQuizComment {
  user: {
    name: string;
    avatarUrl?: string | null;
  };
}

interface CommentsPageData {
  comments: CommentWithUser[];
  nextCursor: string | null;
}

import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { FiGrid, FiList } from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import useSWRInfinite from "swr/infinite";
import PackageCard from "@/components/packages/PackageCard";
import PackageDetailsPanel from "@/components/packages/PackageDetailsPanel";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PRICE_MIN = 0;
const PRICE_MAX = 999;

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

// Skeleton loader for quiz cards
const SkeletonCard = () => (
  <div className="rounded-2xl bg-linear-to-br from-gray-200/40 dark:from-purple-900/40 to-gray-300/30 dark:to-blue-900/30 border border-gray-300/50 dark:border-white/10 shadow-xl p-5 flex flex-col gap-3 animate-pulse">
    <div className="aspect-video w-full bg-gray-300 dark:bg-white/10 rounded-xl mb-2" />
    <div className="h-6 w-2/3 bg-gray-400 dark:bg-white/20 rounded mb-1" />
    <div className="h-4 w-full bg-gray-300 dark:bg-white/10 rounded mb-1" />
    <div className="mt-auto pt-3 border-t border-gray-300/50 dark:border-white/10 flex justify-between items-center">
      <div className="h-4 w-1/3 bg-gray-300 dark:bg-white/10 rounded" />
      <div className="h-4 w-1/4 bg-gray-300 dark:bg-white/10 rounded" />
    </div>
  </div>
);

// Quiz Card component for the factory view
const FactoryQuizCard = ({
  quiz,
  onSelect,
  hideImage = false,
}: {
  quiz: Quiz;
  onSelect: (quiz: Quiz) => void;
  hideImage?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`rounded-2xl bg-linear-to-br from-gray-100/40 dark:from-purple-900/40 to-gray-200/30 dark:to-blue-900/30 border border-gray-300/50 dark:border-white/10 shadow-xl p-5 ${
      hideImage ? "flex-row items-center gap-6" : "flex-col gap-2"
    } cursor-pointer hover:scale-[1.02] transition-all duration-300`}
    onClick={() => onSelect(quiz)}
  >
    {/* Image/Cover (hide in list view) */}
    {!hideImage &&
      (quiz.imageUrl ? (
        <div className="relative aspect-video w-full rounded-xl mb-2 overflow-hidden">
          <Image
            src={quiz.imageUrl}
            alt={quiz.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-linear-to-br from-purple-500/20 to-blue-500/20 rounded-xl mb-2 flex items-center justify-center">
          <span className="text-4xl">🎯</span>
        </div>
      ))}
    <div className="flex-1 min-w-0">
      <h3
        className={`text-lg font-bold text-gray-900 dark:text-white/90 line-clamp-1 ${
          hideImage ? "truncate max-w-[220px]" : ""
        }`}
      >
        {quiz.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-2">
        {quiz.description || "No description provided"}
      </p>
      <div
        className={`flex flex-wrap gap-2 mt-2 ${
          hideImage ? "min-w-[120px]" : ""
        }`}
      >
        <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-white">
          <span className="font-semibold">Time Limit:</span>{" "}
          {quiz.durationInSeconds === 0
            ? "Unlimited"
            : `${Math.floor(quiz.durationInSeconds / 60)} min${
                quiz.durationInSeconds % 60
                  ? " " + (quiz.durationInSeconds % 60) + " sec"
                  : ""
              }`}
        </div>
        <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-white">
          <span className="font-semibold">Locked:</span>{" "}
          {quiz.isLocked ? "Yes" : "No"}
        </div>
        {quiz.difficultyLevel && (
          <span
            className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-semibold ${
              DIFFICULTY_LEVELS.find((d) => d.value === quiz.difficultyLevel)
                ?.color || "bg-slate-700"
            } text-white`}
          >
            {DIFFICULTY_LEVELS.find((d) => d.value === quiz.difficultyLevel)
              ?.label || quiz.difficultyLevel}
          </span>
        )}
      </div>
      <div
        className={`${
          hideImage
            ? "border-0 pt-0 mt-0 flex-col items-start gap-1"
            : "mt-auto pt-3 border-t"
        } border-gray-300/50 dark:border-white/10 flex justify-between items-center text-sm text-gray-600 dark:text-white/60`}
      >
        <div className="flex items-center gap-2">
          <span>👥 {quiz.usersTaken}</span>
          <span>❤️ {quiz.likeCount}</span>
        </div>
        <div className="text-sm font-semibold text-gray-800 dark:text-white/80">
          {quiz.price > 0 ? `₹${quiz.price}` : "Free"}
        </div>
      </div>
    </div>
  </motion.div>
);

// Comments Dialog component
const CommentsDialog = ({
  quiz,
  onClose,
}: {
  quiz: Quiz;
  onClose: () => void;
}) => {
  const getKey = (
    pageIndex: number,
    previousPageData: CommentsPageData | null
  ) => {
    if (previousPageData && !previousPageData.nextCursor) return null; // Reached the end
    if (pageIndex === 0) return `/api/quizzes/${quiz.id}/comments`;
    return `/api/quizzes/${quiz.id}/comments?cursor=${previousPageData?.nextCursor}`;
  };

  const { data, error, isLoading, size, setSize, isValidating } =
    useSWRInfinite(getKey, fetcher);

  const comments = data ? [].concat(...data.map((page) => page.comments)) : [];
  const isEmpty = data?.[0]?.comments?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.nextCursor === null);

  return (
    <Modal open={true} onClose={onClose} transparent>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/90 dark:bg-[#1a1a2e]/90 backdrop-blur-lg rounded-2xl p-2 sm:p-4 w-full h-full border border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white flex flex-col"
      >
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Comments for &ldquo;{quiz.title}&rdquo;
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-white"
          >
            <FiX />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[90vh]">
          {isLoading && !data && (
            <p className="text-gray-700 dark:text-white">Loading comments...</p>
          )}
          {error && (
            <p className="text-red-500 dark:text-red-400">
              Failed to load comments.
            </p>
          )}
          {isEmpty && (
            <p className="text-gray-600 dark:text-white/60">No comments yet.</p>
          )}
          {comments.map((comment: CommentWithUser) => (
            <div
              key={comment.id}
              className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg flex gap-4"
            >
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={comment.user.avatarUrl || "/default_avatar.png"}
                  alt={comment.user.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/50">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-white/80 mt-1">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center shrink-0">
          {!isReachingEnd && (
            <button
              onClick={() => setSize(size + 1)}
              disabled={isValidating}
              className="px-6 py-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 disabled:opacity-50 text-gray-700 dark:text-white"
            >
              {isValidating ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      </motion.div>
    </Modal>
  );
};

// Creator Dashboard Panel component
const CreatorDashboard = ({
  quiz,
  onClose,
  mutate,
}: {
  quiz: Quiz | null;
  onClose: () => void;
  mutate: () => void;
}) => {
  const [isUnpublishAlertOpen, setIsUnpublishAlertOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const router = useRouter();

  const handleUnpublish = async () => {
    if (!quiz) return;
    try {
      await axios.patch(`/api/quizzes/templates/${quiz.id}/unpublish`);
      toast.success("Quiz unpublished and moved to your drafts!");
      mutate(); // Re-fetch the list of published quizzes
      onClose(); // Close the dashboard panel
    } catch (error) {
      toast.error("Failed to unpublish quiz. Please try again.");
      console.error("Unpublish error:", error);
    }
  };

  // NOTE: This earnings calculation is a placeholder.
  // A real implementation should fetch total earnings for the user.
  const placeholderTotalEarnings = 2500; // Example value
  const isEligibleForWithdrawal = placeholderTotalEarnings >= 2000;

  if (!quiz) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-600 dark:text-white/60 p-2 sm:p-6">
        <p className="text-lg mb-2">Select a quiz to view details</p>
        <p className="text-sm text-center">
          View statistics, manage comments, and control your published quizzes
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2 sm:p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white/90">
          {quiz.title}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/90 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-white">
          <span className="font-semibold">Time Limit:</span>{" "}
          {quiz.durationInSeconds === 0
            ? "Unlimited"
            : `${Math.floor(quiz.durationInSeconds / 60)} min${
                quiz.durationInSeconds % 60
                  ? " " + (quiz.durationInSeconds % 60) + " sec"
                  : ""
              }`}
        </div>
        <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-white">
          <span className="font-semibold">Locked:</span>{" "}
          {quiz.isLocked ? "Yes" : "No"}
        </div>
        {quiz.difficultyLevel && (
          <span
            className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-semibold ${
              DIFFICULTY_LEVELS.find((d) => d.value === quiz.difficultyLevel)
                ?.color || "bg-slate-700"
            } text-white`}
          >
            {DIFFICULTY_LEVELS.find((d) => d.value === quiz.difficultyLevel)
              ?.label || quiz.difficultyLevel}
          </span>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-white/60">
            Total Attempts
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
            {quiz.usersTaken}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-white/60">Likes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
            {quiz.likeCount}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-white/60">
            Average Score
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
            {quiz.averageScore.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-white/60">Rating</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
            ⭐ {quiz.rating.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setIsCommentsDialogOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-white/90 flex items-center justify-center gap-2"
        >
          📝 See Comments
        </button>
        <button
          onClick={() => setIsUnpublishAlertOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors text-red-600 dark:text-red-400 flex items-center justify-center gap-2"
        >
          🕳️ Unpublish Quiz
        </button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (isEligibleForWithdrawal) {
                    router.push("/withdraw");
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center gap-2 transition-all"
                disabled={!isEligibleForWithdrawal}
              >
                💰 Withdraw Amount
              </button>
            </TooltipTrigger>
            {!isEligibleForWithdrawal && (
              <TooltipContent>
                <p>Withdrawal is available after you earn ₹2000</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <AlertDialog
        open={isUnpublishAlertOpen}
        onOpenChange={setIsUnpublishAlertOpen}
      >
        <AlertDialogContent className="bg-white/90 dark:bg-[#1a1a2e]/90 backdrop-blur-lg border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to unpublish this quiz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the quiz from the public explore page and move it
              back to your private templates. You can republish it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublish}>
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isCommentsDialogOpen && quiz && (
        <CommentsDialog
          quiz={quiz}
          onClose={() => setIsCommentsDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default function FactoryDialog({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sort, setSort] = useState("createdAt_desc");
  const calendarBtnRef = useRef<HTMLButtonElement>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [debouncedSearch] = useDebounce(search, 500);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [viewType, setViewType] = useState<"quiz" | "package">("quiz");
  const [selectedPackage, setSelectedPackage] = useState<QuizPackage | null>(
    null
  );
  const { data: packages, mutate: mutatePackages } = useSWR(
    viewType === "package" ? "/api/packages" : null,
    fetcher
  );
  const allPackages = packages || [];
  const selectedPackageQuizIds = selectedPackage?.quizIds || [];
  const { data: selectedPackageQuizzes } = useSWR(
    selectedPackage && selectedPackageQuizIds.length > 0
      ? ["factory-package-quizzes", selectedPackageQuizIds]
      : null,
    async () => {
      const url = `/api/quizzes/bulk?ids=${selectedPackageQuizIds.join(",")}`;
      const res = await fetch(url);
      const data = await res.json();
      return data;
    }
  );
  const { data: selectedPackageStats, error: selectedPackageStatsError } =
    useSWR(
      selectedPackage ? `/api/packages/stats?id=${selectedPackage.id}` : null,
      fetcher
    );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    imageUrl: "",
    quizIds: [] as string[],
    price: 0,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [pricingMode, setPricingMode] = useState<"free" | "paid">("free");
  const { data: allPublishedQuizzes, isLoading: loadingPublishedQuizzes } =
    useSWR("/api/quizzes/published", fetcher);
  const [publishLoading, setPublishLoading] = useState(false);
  const isMounted = useRef(true);
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const resetFilters = () => {
    setSearch("");
    setPrice([PRICE_MIN, PRICE_MAX]);
    setDateRange(undefined);
    setSort("createdAt_desc");
  };

  // Build query params
  const params = new URLSearchParams();
  if (debouncedSearch) params.append("search", debouncedSearch);
  params.append("minPrice", String(price[0]));
  if (price[1] < PRICE_MAX) params.append("maxPrice", String(price[1]));
  if (dateRange?.from) params.append("fromDate", dateRange.from.toISOString());
  if (dateRange?.to) params.append("toDate", dateRange.to.toISOString());
  if (sort) {
    const [sortBy, sortOrder] = sort.split("_");
    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);
  }

  // Fetch published quizzes
  const {
    data: quizzes,
    error,
    isLoading,
    mutate,
  } = useSWR<Quiz[]>(`/api/quizzes/published?${params.toString()}`, fetcher);

  // Handler for publish/unpublish package (move inside component)
  const handlePublishPackage = async (pkg: QuizPackage, publish: boolean) => {
    if (publishLoading) return; // Prevent double clicks
    setPublishLoading(true);
    const payload = {
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      imageUrl: pkg.imageUrl,
      quizIds: pkg.quizIds,
      isPublished: publish,
    };
    try {
      const res = await fetch(`/api/packages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorMsg = "Failed to update package publish status.";
        if (res.status === 404) {
          errorMsg =
            "This package no longer exists or you do not have permission.";
        } else if (res.status === 400) {
          try {
            const data = await res.json();
            if (data?.error?.includes("Missing required fields")) {
              errorMsg =
                "Please fill all required fields and add at least one quiz to your package.";
            } else if (data?.error) {
              errorMsg = data.error;
            }
          } catch (err) {
            console.error("Error parsing error response:", err);
          }
        } else {
          try {
            const data = await res.json();
            if (data?.error) errorMsg = data.error;
          } catch (err) {
            console.error("Error parsing error response:", err);
          }
        }
        console.error("Publish error (non-ok response):", errorMsg, res.status);
        if (isMounted.current) toast.error(errorMsg);
        setPublishLoading(false);
        return;
      }
      if (isMounted.current) {
        mutatePackages();
        setSelectedPackage((prev) =>
          prev ? ({ ...prev, isPublished: publish } as typeof prev) : null
        );
        toast.success(publish ? "Package published!" : "Package unpublished!");
      }
    } catch (err) {
      console.error("Publish error (network or unexpected):", err);
      if (isMounted.current)
        toast.error("Network error: Could not reach the server.");
    } finally {
      if (isMounted.current) setPublishLoading(false);
    }
  };

  // Load selectedPackage from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedPackage");
    if (saved) {
      try {
        setSelectedPackage(JSON.parse(saved));
      } catch {}
    }
  }, []);
  // Save selectedPackage to localStorage when it changes
  useEffect(() => {
    if (selectedPackage) {
      localStorage.setItem("selectedPackage", JSON.stringify(selectedPackage));
    } else {
      localStorage.removeItem("selectedPackage");
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (selectedPackageStatsError && selectedPackageStatsError.status === 404) {
      setSelectedPackage(null);
      localStorage.removeItem("selectedPackage");
    }
  }, [selectedPackageStatsError]);

  return (
    <Modal open={true} onClose={onClose} fullScreen>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full h-full flex flex-col bg-linear-to-br from-gray-50/90 dark:from-[#181a20]/90 to-gray-100/90 dark:to-[#23243a]/90"
      >
        {/* Header with Filters */}
        <div className="w-full bg-white/80 dark:bg-black/50 border-b border-gray-200 dark:border-white/10 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-4 md:gap-0 md:flex-row md:items-start md:justify-between">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search Input */}
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-60">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">
                  Search
                </label>
                <input
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full h-10"
                  placeholder="Search your quizzes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Price Range Slider */}
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-60">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">
                  Price Range
                </label>
                <div className="flex flex-col gap-0.5 bg-white dark:bg-white/10 rounded-xl px-4 py-2 border border-gray-300 dark:border-white/20 shadow-sm backdrop-blur-md w-full">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-white/60 mb-0.5">
                    <span>Min: ₹{price[0]}</span>
                    <span>
                      Max: ₹{price[1] === PRICE_MAX ? "999+" : price[1]}
                    </span>
                  </div>
                  <Slider
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={10}
                    value={price}
                    onValueChange={(v) =>
                      setPrice([v[0] ?? PRICE_MIN, v[1] ?? v[0] ?? PRICE_MAX])
                    }
                    defaultValue={[PRICE_MIN, PRICE_MAX]}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-60 relative">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">
                  Date Range
                </label>
                <button
                  ref={calendarBtnRef}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm w-full text-left backdrop-blur-md relative h-10"
                  onClick={() => setShowCalendar((v) => !v)}
                  type="button"
                >
                  {dateRange && dateRange.from && dateRange.to
                    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    : "Select date range"}
                  <span className="ml-auto text-gray-400 dark:text-white/40">
                    ▼
                  </span>
                </button>
                {showCalendar && (
                  <div
                    className="absolute left-0 top-[110%] z-50 bg-white dark:bg-black/95 border border-gray-200 dark:border-white/20 rounded-xl shadow-2xl p-2 min-w-[260px] animate-fade-in-up"
                    style={{
                      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                    }}
                  >
                    <div
                      className="absolute -top-2 left-8 w-4 h-4 bg-white dark:bg-black/95 border-l border-t border-gray-200 dark:border-white/20 rotate-45"
                      style={{ zIndex: 2 }}
                    />
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range && range.from && range.to)
                          setShowCalendar(false);
                      }}
                      numberOfMonths={1}
                      initialFocus
                    />
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-60">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">
                  Sort By
                </label>
                <select
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full h-10"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="createdAt_desc">Most Recent</option>
                  <option value="createdAt_asc">Oldest</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="usersTaken_desc">Most Attempted</option>
                  <option value="likeCount_desc">Most Liked</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="price_desc">Price (High-Low)</option>
                  <option value="price_asc">Price (Low-High)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-2 md:mt-0 md:ml-6 self-end md:self-center md:translate-y-[7.2px]">
              <button
                className="px-8 py-2 rounded-xl bg-linear-to-r from-pink-500 to-blue-500 text-white font-bold shadow hover:from-pink-600 hover:to-blue-600 transition-all border-0 focus:ring-2 focus:ring-pink-400 w-full md:w-[120px] h-10"
                onClick={resetFilters}
                type="button"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="px-8 py-2 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all shadow focus:ring-2 focus:ring-blue-400 w-full md:w-[120px] h-10"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Quiz Grid/List */}
          <div className="flex-1 flex flex-col p-2 sm:p-6 overflow-y-auto bg-gray-50/50 dark:bg-black/20">
            {/* Toggle for Quiz/Package View + Grid/List */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex rounded-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 shadow-sm overflow-hidden mr-4">
                <button
                  className={`px-4 py-2 flex items-center gap-2 transition-all ${
                    viewType === "quiz"
                      ? "bg-linear-to-r from-purple-500 to-blue-500 text-white"
                      : "text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                  onClick={() => setViewType("quiz")}
                  aria-label="Quiz View"
                  type="button"
                >
                  <span role="img" aria-label="Quiz">
                    📄
                  </span>{" "}
                  Quizzes
                </button>
                <button
                  className={`px-4 py-2 flex items-center gap-2 transition-all ${
                    viewType === "package"
                      ? "bg-linear-to-r from-purple-500 to-blue-500 text-white"
                      : "text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                  onClick={() => setViewType("package")}
                  aria-label="Package View"
                  type="button"
                >
                  <span role="img" aria-label="Package">
                    📦
                  </span>{" "}
                  Packages
                </button>
              </div>
              <div className="inline-flex rounded-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 shadow-sm overflow-hidden">
                <button
                  className={`px-4 py-2 flex items-center gap-2 transition-all ${
                    viewMode === "grid"
                      ? "bg-linear-to-r from-purple-500 to-blue-500 text-white"
                      : "text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid View"
                  type="button"
                >
                  <FiGrid size={20} />
                </button>
                <button
                  className={`px-4 py-2 flex items-center gap-2 transition-all ${
                    viewMode === "list"
                      ? "bg-linear-to-r from-purple-500 to-blue-500 text-white"
                      : "text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                  onClick={() => setViewMode("list")}
                  aria-label="List View"
                  type="button"
                >
                  <FiList size={20} />
                </button>
              </div>
              {viewType === "package" && (
                <Button
                  variant="default"
                  size="lg"
                  className="font-bold ml-2 bg-linear-to-r from-purple-500 via-blue-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600 focus:ring-2 focus:ring-pink-400 border-0 transition-all duration-300 flex items-center gap-2"
                  onClick={() => setShowCreateDialog(true)}
                  style={{
                    boxShadow:
                      "0 4px 24px 0 rgba(124,58,237,0.25), 0 1.5px 8px 0 rgba(236,72,153,0.15)",
                  }}
                >
                  <span>+ Create Package</span>
                </Button>
              )}
            </div>
            {/* Main Content: Quiz or Package Grid/List */}
            {viewType === "quiz" ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {isLoading &&
                  [...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                {!isLoading && error && (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-red-500 dark:text-red-400">
                    <p>Failed to load published quizzes.</p>
                  </div>
                )}
                {!isLoading && !error && quizzes?.length === 0 && (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-600 dark:text-white/60">
                    <p className="text-lg">No published quizzes found.</p>
                    <p>Start by publishing some of your quiz templates!</p>
                  </div>
                )}
                {quizzes?.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={viewMode === "list" ? "w-full" : ""}
                  >
                    <FactoryQuizCard
                      quiz={quiz}
                      onSelect={(q) => setSelectedQuiz(q)}
                      hideImage={viewMode === "list"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {allPackages.length === 0 && (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-600 dark:text-white/60">
                    <p className="text-lg">No packages found.</p>
                    <p>Create a package to see it here!</p>
                  </div>
                )}
                {allPackages.map((pkg: QuizPackage) => {
                  const quizThumbs = (pkg.quizIds || [])
                    .slice(0, 3)
                    .map((qid: string) => {
                      const quiz = (selectedPackageQuizzes || []).find(
                        (q: Quiz) => q.id === qid
                      );
                      return quiz
                        ? { imageUrl: quiz.imageUrl, title: quiz.title }
                        : { title: "Quiz" };
                    });
                  return (
                    <div
                      key={pkg.id}
                      className={viewMode === "list" ? "w-full" : ""}
                    >
                      <PackageCard
                        pkg={{
                          ...pkg,
                          description: pkg.description ?? undefined,
                          imageUrl: pkg.imageUrl ?? undefined,
                          createdAt: pkg.createdAt.toISOString(),
                          quizThumbnails: quizThumbs,
                        }}
                        onSelect={(_selectedPkg) => setSelectedPackage(pkg)}
                        hideImage={viewMode === "list"}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Right Panel: Details */}
          <div className="w-full md:w-[400px] border-l border-gray-200 dark:border-white/10 bg-white dark:bg-black/30">
            {viewType === "quiz" ? (
              <CreatorDashboard
                quiz={selectedQuiz}
                onClose={() => setSelectedQuiz(null)}
                mutate={mutate}
              />
            ) : selectedPackage ? (
              <PackageDetailsPanel
                pkg={{
                  ...selectedPackage,
                  description: selectedPackage.description ?? undefined,
                  imageUrl: selectedPackage.imageUrl ?? undefined,
                  createdAt: selectedPackage.createdAt.toISOString(),
                }}
                quizzes={selectedPackageQuizzes || []}
                onClose={() => setSelectedPackage(null)}
                onUpdate={async (updatedPkg) => {
                  await fetch("/api/packages", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedPkg),
                  });
                  mutatePackages();
                  // Convert back to Prisma type for state
                  setSelectedPackage({
                    ...selectedPackage,
                    title: updatedPkg.title,
                    description: updatedPkg.description ?? null,
                    imageUrl: updatedPkg.imageUrl ?? null,
                    price: updatedPkg.price,
                  });
                }}
                onDelete={async () => {
                  await fetch("/api/packages", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: selectedPackage.id }),
                  });
                  mutatePackages();
                  setSelectedPackage(null);
                }}
                onPublish={async () => {
                  await handlePublishPackage(
                    selectedPackage,
                    !selectedPackage.isPublished
                  );
                }}
                stats={selectedPackageStats}
                statsError={selectedPackageStatsError}
                availableQuizzes={allPublishedQuizzes || []}
                publishLoading={publishLoading}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-white/40">
                Select a package to view details
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {showCreateDialog && (
        <Modal
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          wide={true}
        >
          <div className="bg-white/90 dark:bg-linear-to-br from-[#181a20]/90 to-[#23243a]/90 border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              Create a Quiz Package
            </h2>
            <button
              onClick={() => setShowCreateDialog(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/90 text-2xl"
            >
              &times;
            </button>
            <div className="flex flex-col md:flex-row gap-8 w-full min-w-0">
              {/* Left: Quiz selection */}
              <div className="flex-1 min-w-0 bg-gray-50 dark:bg-black/10 rounded-xl p-4 border border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Select Published Quizzes
                </h3>
                {loadingPublishedQuizzes ? (
                  <div className="text-gray-500 dark:text-white/50">
                    Loading quizzes...
                  </div>
                ) : allPublishedQuizzes && allPublishedQuizzes.length > 0 ? (
                  <ul className="space-y-2">
                    {allPublishedQuizzes.map((q: Quiz) => (
                      <li key={q.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={newPackage.quizIds.includes(q.id)}
                          onChange={(e) => {
                            setNewPackage((np) => ({
                              ...np,
                              quizIds: e.target.checked
                                ? [...np.quizIds, q.id]
                                : np.quizIds.filter((id) => id !== q.id),
                            }));
                          }}
                          className="accent-blue-500 w-4 h-4"
                          id={`quiz-${q.id}`}
                        />
                        <div className="relative w-10 h-8 rounded-md overflow-hidden bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                          {q.imageUrl ? (
                            <Image
                              src={q.imageUrl}
                              alt={q.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <span className="text-gray-400 dark:text-white/30">
                              📄
                            </span>
                          )}
                        </div>
                        <label
                          htmlFor={`quiz-${q.id}`}
                          className="text-gray-700 dark:text-white/80 cursor-pointer truncate max-w-40"
                        >
                          {q.title}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 dark:text-white/50">
                    No published quizzes available.
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-600 dark:text-white/60">
                  {newPackage.quizIds.length} quizzes selected
                </div>
              </div>
              {/* Right: Package details */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <label className="block text-gray-700 dark:text-white/80 font-semibold">
                  Package Name
                </label>
                <input
                  type="text"
                  value={newPackage.title}
                  onChange={(e) =>
                    setNewPackage((np) => ({ ...np, title: e.target.value }))
                  }
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full"
                  placeholder="Enter package name"
                />
                <label className="block text-gray-700 dark:text-white/80 font-semibold">
                  Description
                </label>
                <textarea
                  value={newPackage.description}
                  onChange={(e) =>
                    setNewPackage((np) => ({
                      ...np,
                      description: e.target.value,
                    }))
                  }
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full min-h-[60px]"
                  placeholder="Enter description (optional)"
                />
                <label className="block text-gray-700 dark:text-white/80 font-semibold">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newPackage.imageUrl}
                  onChange={(e) =>
                    setNewPackage((np) => ({ ...np, imageUrl: e.target.value }))
                  }
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full"
                  placeholder="Image URL (optional)"
                />
                {/* Package Pricing */}
                <div className="space-y-3">
                  <label className="block text-gray-700 dark:text-white/80 font-semibold">
                    Package Pricing
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPricingMode("free");
                        setNewPackage((np) => ({ ...np, price: 0 }));
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        pricingMode === "free"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20"
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPricingMode("paid");
                        setNewPackage((np) => ({
                          ...np,
                          price: np.price === 0 ? 100 : np.price,
                        }));
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        pricingMode === "paid"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20"
                      }`}
                    >
                      Paid
                    </button>
                  </div>
                  {pricingMode === "paid" && (
                    <div className="relative">
                      <input
                        type="number"
                        value={newPackage.price / 100}
                        onChange={(e) => {
                          const value = Math.max(
                            0,
                            parseInt(e.target.value) || 0
                          );
                          setNewPackage((np) => ({
                            ...np,
                            price: value * 100,
                          }));
                          // Keep pricing mode as 'paid' even when value is 0
                          if (pricingMode !== "paid") {
                            setPricingMode("paid");
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full pr-12"
                        placeholder="0"
                        min="0"
                        step="1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white/60">
                        ₹
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="font-bold min-w-[140px]"
                    disabled={
                      !newPackage.title ||
                      newPackage.quizIds.length === 0 ||
                      createLoading
                    }
                    onClick={async () => {
                      setCreateLoading(true);
                      await fetch("/api/packages", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newPackage),
                      });
                      mutatePackages();
                      setNewPackage({
                        title: "",
                        description: "",
                        imageUrl: "",
                        quizIds: [],
                        price: 0,
                      });
                      setPricingMode("free");
                      setCreateLoading(false);
                      setShowCreateDialog(false);
                    }}
                  >
                    {createLoading ? "Creating..." : "Create Package"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
