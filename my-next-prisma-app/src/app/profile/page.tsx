"use client";
import { UserCard } from "./components/UserCard";
import { PerformancePanel } from "./components/PerformancePanel";
import { QuizTimeline } from "./components/QuizTimeline";
import { Achievements } from "./components/Achievements";
import { LeaderboardPanel } from "./components/LeaderboardPanel";
import { CreatedQuizzes } from "./components/CreatedQuizzes";
import { AccountSettings } from "./components/AccountSettings";
import { PremiumSummary } from "./components/PremiumSummary";
import { LiveQuizMap } from "./components/LiveQuizMap";
import { BioCard } from "./components/BioCard";
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useSWR from "swr";
import { PageLoader } from "@/components/ui/loading";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  // Add a key that includes user?.id so SWR refetches when user changes
  const {
    data: profileData,
    error: profileError,
    isValidating: profileValidating,
    mutate: mutateProfile,
  } = useSWR(
    user ? ["/api/users/" + user?.id + "/profile", user?.id] : null,
    ([url]) => fetch(url).then((res) => res.json()),
    { revalidateOnFocus: true, shouldRetryOnError: false }
  );
  const [showEdit, setShowEdit] = React.useState(false);
  const openEdit = () => setShowEdit(true);
  const openEditSocials = () => {
    setShowEdit(true);
    setTimeout(() => {
      const socialsField = document.getElementById("edit-socials-section");
      if (socialsField)
        socialsField.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  };

  // Improved loading state: show spinner if user context or profile is loading/validating
  if (loading || profileValidating) {
    return <PageLoader text="Loading profile..." />;
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-linear-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white">
        <div className="text-xl">You must be signed in to view this page.</div>
      </main>
    );
  }

  // Improved error handling: show retry button if fetch failed
  if (profileData?.error || profileError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-linear-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white">
        <div className="bg-white dark:bg-[#181a2a]/90 p-8 rounded-2xl shadow-2xl text-center border border-gray-200 dark:border-white/10">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Profile Not Found
          </h1>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            We couldn&apos;t find your profile in the database. Try logging out
            and logging in again, or contact support if the issue persists.
          </p>
          <button
            className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => mutateProfile()}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-linear-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white relative overflow-x-hidden pt-14 md:pt-18">
      {/* Floating Orbs */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-linear-to-br from-purple-500/10 to-blue-600/10 dark:from-purple-500/30 dark:to-blue-600/30 rounded-full blur-3xl animate-float z-0" />
      <div
        className="absolute top-1/2 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-purple-600/10 dark:from-blue-500/30 dark:to-purple-600/30 rounded-full blur-2xl animate-float z-0"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-28 h-28 bg-linear-to-br from-yellow-500/10 to-orange-600/10 dark:from-yellow-500/20 dark:to-orange-600/20 rounded-full blur-2xl animate-float z-0"
        style={{ animationDelay: "4s" }}
      />
      <section className="relative z-10 max-w-7xl mx-auto py-6 sm:py-10 px-2 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-5 sm:gap-7 col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <UserCard
              openEdit={openEdit}
              openEditSocials={openEditSocials}
              mutateProfile={mutateProfile}
            />
          </motion.div>
          {profileData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <BioCard bio={profileData.bio} />
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SectionHeader>Achievements</SectionHeader>
            <Achievements />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SectionHeader>Premium</SectionHeader>
            <PremiumSummary />
          </motion.div>
        </div>
        {/* Right Column (spans 2 columns on desktop) */}
        <div className="flex flex-col gap-5 sm:gap-7 col-span-1 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionHeader>Performance</SectionHeader>
            <PerformancePanel />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SectionHeader>Quiz Timeline</SectionHeader>
            <QuizTimeline />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SectionHeader>Leaderboard</SectionHeader>
            <LeaderboardPanel />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SectionHeader>Created Quizzes</SectionHeader>
            <CreatedQuizzes />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SectionHeader>Live Quiz Map</SectionHeader>
            <LiveQuizMap />
          </motion.div>
        </div>
      </section>
      {/* Edit Profile Modal (always rendered at page level) */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/60 flex items-center justify-center z-50 animate-fade-in p-2 sm:p-6">
          <div className="w-full max-w-full sm:max-w-lg flex items-center justify-center">
            <AccountSettings
              onClose={() => setShowEdit(false)}
              onSave={() => {
                setShowEdit(false);
                mutateProfile();
              }}
            />
            <button
              className="absolute top-4 right-4 text-gray-900 dark:text-white text-2xl z-50"
              onClick={() => setShowEdit(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="h-0.5 w-5 bg-linear-to-r from-purple-500 to-blue-500 rounded-full" />
      <h2 className="text-lg md:text-xl font-bold tracking-wide bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        {children}
      </h2>
      <span className="flex-1 h-0.5 bg-linear-to-r from-blue-500/40 to-transparent rounded-full" />
    </div>
  );
}
