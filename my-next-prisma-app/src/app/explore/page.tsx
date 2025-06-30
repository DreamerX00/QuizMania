"use client";
import TopTagsBar from "./components/TopTagsBar";
import QuizGrid from "./components/QuizGrid";
import { useState, useMemo } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import QuizDetailModal from "./components/QuizDetailModal";
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import FilterModalContent from "./components/FilterModalContent";
import Accordion from "@/components/ui/Accordion";
import QuizCarousel from "@/components/ui/QuizCarousel";
import ExploreSectionDialog from "./components/ExploreSectionDialog";
import { useUser } from "@clerk/nextjs";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ExplorePage() {
  const { user } = useUser();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
    field: '',
    subject: '',
    minPrice: 0,
    maxPrice: 100,
    difficulty: [],
    quizType: [],
    isFree: null,
    dateRange: { from: '', to: '' },
  });

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm);
    }
    if (filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);
    if (filters.field) params.append('field', filters.field);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 100) params.append('maxPrice', filters.maxPrice.toString());
    // New filters
    if (filters.difficulty.length > 0) params.append('difficulty', filters.difficulty.join(','));
    if (filters.quizType.length > 0) params.append('quizType', filters.quizType.join(','));
    if (filters.isFree !== null) params.append('isFree', String(filters.isFree));
    if (filters.dateRange?.from) params.append('fromDate', filters.dateRange.from);
    if (filters.dateRange?.to) params.append('toDate', filters.dateRange.to);
    return params.toString();
  }, [debouncedSearchTerm, filters]);
  
  const { data: quizzes, error, isLoading } = useSWR(`/api/quizzes?${queryString}`, fetcher);
  
  // Fetch user profile and unlocked quizzes
  const { data: userProfile } = useSWR(
    user ? `/api/users/${user.id}/profile` : null, 
    fetcher
  );
  
  const { data: unlockedQuizzesData, mutate: unlockedQuizzesMutate } = useSWR(
    user ? '/api/users/unlocked-quizzes' : null,
    fetcher
  );

  // Create a map of unlocked quiz IDs for quick lookup
  const unlockedQuizIds = useMemo(() => {
    if (!unlockedQuizzesData?.unlockedQuizzes) return new Set();
    return new Set(unlockedQuizzesData.unlockedQuizzes.map((uq: any) => uq.quizId));
  }, [unlockedQuizzesData]);

  // Check if user is premium
  const isPremiumUser = useMemo(() => {
    if (!userProfile?.user) return false;
    const { accountType, premiumUntil } = userProfile.user;
    if (accountType === 'PREMIUM' || accountType === 'LIFETIME') {
      if (accountType === 'LIFETIME') return true;
      if (premiumUntil && new Date(premiumUntil) > new Date()) return true;
    }
    return false;
  }, [userProfile]);

  // Client-side filtering for new fields
  const filteredQuizzes = (quizzes || []).filter((q: any) => {
    // Difficulty (assuming q.difficultyLevel is a string like 'EASY', 'MEDIUM', etc.)
    if (filters.difficulty.length > 0 && (!q.difficultyLevel || !filters.difficulty.some(d => q.difficultyLevel.toLowerCase().includes(d.toLowerCase().replace(/ /g, '_'))))) {
      return false;
    }
    // Quiz Type (assuming q.tags or q.quizType)
    if (filters.quizType.length > 0 && (!q.tags || !filters.quizType.some(type => q.tags.map((t: string) => t.toLowerCase()).includes(type.toLowerCase())))) {
      return false;
    }
    // Free/Paid
    if (filters.isFree === true && q.price > 0) return false;
    if (filters.isFree === false && q.price === 0) return false;
    // Date Range
    if (filters.dateRange?.from && new Date(q.createdAt) < new Date(filters.dateRange.from)) return false;
    if (filters.dateRange?.to && new Date(q.createdAt) > new Date(filters.dateRange.to)) return false;
    return true;
  });

  // Filtering logic for each section
  const heatingQuizzes = filteredQuizzes.filter(
    (q: any) =>
      q.tags?.some((t: string) =>
        ["#trending", "#hot"].includes(t.toLowerCase())
      )
  );

  const popularQuizzes = filteredQuizzes
    .slice()
    .sort((a: any, b: any) =>
      (b.likeCount + b.usersTaken) - (a.likeCount + a.usersTaken)
    )
    .slice(0, 8);

  const packageQuizzes = filteredQuizzes.filter(
    (q: any) =>
      q.tags?.some((t: string) =>
        ["#package", "#bundle"].includes(t.toLowerCase())
      )
  );

  const recentQuizzes = filteredQuizzes
    .slice()
    .sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  // Dialog state for each section
  const [openDialog, setOpenDialog] = useState<null | string>(null);

  const handleOpenQuizDetail = (quiz: any) => {
    setSelectedQuiz(quiz);
  };

  const handleCloseQuizDetail = () => {
    setSelectedQuiz(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-white dark:from-[#0a0a0f] dark:via-[#1a1a2e] dark:to-[#16213e] text-foreground relative overflow-x-hidden">
      {/* Animated Floating Orbs/Lines */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-blue-600/30 rounded-full blur-3xl animate-float z-0" />
      <div className="absolute top-1/2 right-0 w-60 h-60 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '4s' }} />
      {/* Hero Section */}
      <section className="relative z-20 max-w-7xl mx-auto pt-16 pb-6 px-2 md:px-8 text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold futuristic-title bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent animate-gradient-move mb-4 drop-shadow-xl tracking-tight">
          Explore Quizzes
        </h1>
        <p className="text-base sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8 font-medium futuristic-subtitle animate-fade-in-up">
          Discover, filter, and attempt the best quizzes from every field. Use tags and filters to find your next challenge!
        </p>
      </section>
      {/* Top Tags Bar */}
      <div className="relative z-20">
        <TopTagsBar />
      </div>
      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto flex flex-col flex-1 gap-6 sm:gap-10 py-8 sm:py-12 px-2 md:px-8 relative z-10">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 w-full">
          <div className="relative flex-1 max-w-lg w-full">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/70" />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <FiFilter />
            <span>Filters & Sort</span>
          </button>
        </div>

        {/* Main Quiz Grid Area - Now Full Width */}
        <section className="flex-1 min-w-0 relative">
          {heatingQuizzes.length > 0 && (
            <Accordion title="Heating Quizzes">
              <QuizCarousel 
                quizzes={heatingQuizzes} 
                onQuizClick={handleOpenQuizDetail}
                isPremiumUser={isPremiumUser}
                unlockedQuizIds={unlockedQuizIds}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white font-bold shadow-glow border border-white/20 hover:scale-105 hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200 backdrop-blur-md"
                  onClick={() => setOpenDialog("heating")}
                >
                  View All
                </button>
              </div>
            </Accordion>
          )}
          {popularQuizzes.length > 0 && (
            <Accordion title="Popular">
              <QuizCarousel 
                quizzes={popularQuizzes} 
                onQuizClick={handleOpenQuizDetail}
                isPremiumUser={isPremiumUser}
                unlockedQuizIds={unlockedQuizIds}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white font-bold shadow-glow border border-white/20 hover:scale-105 hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200 backdrop-blur-md"
                  onClick={() => setOpenDialog("popular")}
                >
                  View All
                </button>
              </div>
            </Accordion>
          )}
          {packageQuizzes.length > 0 && (
            <Accordion title="Packages">
              <QuizCarousel 
                quizzes={packageQuizzes} 
                onQuizClick={handleOpenQuizDetail}
                isPremiumUser={isPremiumUser}
                unlockedQuizIds={unlockedQuizIds}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white font-bold shadow-glow border border-white/20 hover:scale-105 hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200 backdrop-blur-md"
                  onClick={() => setOpenDialog("packages")}
                >
                  View All
                </button>
              </div>
            </Accordion>
          )}
          {recentQuizzes.length > 0 && (
            <Accordion title="Recent Uploads">
              <QuizCarousel 
                quizzes={recentQuizzes} 
                onQuizClick={handleOpenQuizDetail}
                isPremiumUser={isPremiumUser}
                unlockedQuizIds={unlockedQuizIds}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white font-bold shadow-glow border border-white/20 hover:scale-105 hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200 backdrop-blur-md"
                  onClick={() => setOpenDialog("recent")}
                >
                  View All
                </button>
              </div>
            </Accordion>
          )}
        </section>
        {/* Dialogs for each section */}
        {heatingQuizzes.length > 0 && (
          <ExploreSectionDialog
            open={openDialog === "heating"}
            onClose={() => setOpenDialog(null)}
            title="Heating Quizzes"
            quizzes={heatingQuizzes}
            isPremiumUser={isPremiumUser}
            unlockedQuizIds={unlockedQuizIds}
          />
        )}
        {popularQuizzes.length > 0 && (
          <ExploreSectionDialog
            open={openDialog === "popular"}
            onClose={() => setOpenDialog(null)}
            title="Popular"
            quizzes={popularQuizzes}
            isPremiumUser={isPremiumUser}
            unlockedQuizIds={unlockedQuizIds}
          />
        )}
        {packageQuizzes.length > 0 && (
          <ExploreSectionDialog
            open={openDialog === "packages"}
            onClose={() => setOpenDialog(null)}
            title="Packages"
            quizzes={packageQuizzes}
            isPremiumUser={isPremiumUser}
            unlockedQuizIds={unlockedQuizIds}
          />
        )}
        {recentQuizzes.length > 0 && (
          <ExploreSectionDialog
            open={openDialog === "recent"}
            onClose={() => setOpenDialog(null)}
            title="Recent Uploads"
            quizzes={recentQuizzes}
            isPremiumUser={isPremiumUser}
            unlockedQuizIds={unlockedQuizIds}
          />
        )}
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative z-10 w-full flex justify-center items-center">
            <FilterModalContent 
              filters={filters}
              setFilters={setFilters}
              onClose={() => setIsFilterModalOpen(false)}
            />
          </div>
        </div>
      )}

      {selectedQuiz && (
        <QuizDetailModal
          quiz={selectedQuiz}
          onClose={handleCloseQuizDetail}
          isPremiumUser={isPremiumUser}
          isUnlocked={unlockedQuizIds.has(selectedQuiz.id)}
          onUnlockUpdate={() => unlockedQuizzesMutate()}
        />
      )}
    </main>
  );
} 