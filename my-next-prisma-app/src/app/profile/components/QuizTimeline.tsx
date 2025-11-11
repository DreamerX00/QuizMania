import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import Modal from "@/components/ui/Modal";
import ScoreSummaryModalContent from "./ScoreSummaryModalContent";

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) =>
    res.json()
  );

const tabs = ["All", "Completed", "In Progress", "Failed", "Retake Available"];

export function QuizTimeline() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const { data, isLoading } = useSWR(
    user && token ? [`/api/users/${user?.id}/stats`, token] : null,
    ([url, token]) => fetcher(url, token)
  );
  const [activeTab, setActiveTab] = React.useState("All");
  const [scoreModal, setScoreModal] = React.useState<{
    quizId: string;
    attemptId: string;
  } | null>(null);

  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[180px] border border-gray-200 dark:border-white/10" />
    );
  }

  const quizzes = data.recentQuizzes || [];

  return (
    <motion.div
      className="relative bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-4 md:p-6 shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl overflow-hidden min-h-[180px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.7 }}
    >
      {/* Floating Orbs */}
      <div className="absolute -top-8 -left-8 w-16 h-16 bg-linear-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-2xl animate-float z-0" />
      <div
        className="absolute bottom-0 right-0 w-12 h-12 bg-linear-to-br from-pink-400/10 to-blue-400/10 dark:from-pink-400/20 dark:to-blue-400/20 rounded-full blur-2xl animate-float z-0"
        style={{ animationDelay: "2s" }}
      />
      <div className="flex gap-2 mb-4 z-10 relative flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm border border-gray-200 dark:border-white/10 transition-all duration-200 ${
              activeTab === tab
                ? "bg-linear-to-r from-blue-600 to-pink-600 text-white animate-glow"
                : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 z-10 relative">
        {quizzes.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No quizzes taken yet.
          </div>
        ) : (
          quizzes.map((quiz: any, i: number) => (
            <motion.div
              key={quiz.attemptId || quiz.id || i}
              className="bg-linear-to-br from-blue-900/60 to-pink-900/40 rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 hover:scale-[1.02] transition shadow border border-white/10 backdrop-blur-md"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-base md:text-lg truncate">
                    {quiz.title || "Untitled Quiz"}
                  </div>
                  {quiz.type === "ai" && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white">
                      AI
                    </span>
                  )}
                </div>
                <div className="text-gray-400 text-xs md:text-sm">
                  Score:{" "}
                  {quiz.score ?? (
                    <span className="text-gray-500">Not calculated</span>
                  )}
                </div>
                <div className="text-gray-400 text-[10px] md:text-xs">
                  Date:{" "}
                  {quiz.date ? (
                    new Date(quiz.date).toLocaleDateString()
                  ) : (
                    <span className="text-gray-500">Unknown</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {quiz.type === "ai" && quiz.slug ? (
                  <>
                    <a
                      href={`/generate-random-quiz/play/${quiz.slug}`}
                      className="futuristic-button px-3 py-1 text-xs md:text-sm font-semibold"
                      tabIndex={-1}
                    >
                      Retake
                    </a>
                    <a
                      href={`/generate-random-quiz/results/${quiz.attemptId}`}
                      className="px-3 py-1 rounded-full bg-green-600/80 text-white hover:bg-green-700 transition text-xs md:text-sm font-semibold"
                      tabIndex={-1}
                    >
                      View Results
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href={quiz.quizId ? `/quiz/${quiz.quizId}/take` : "#"}
                      className="futuristic-button px-3 py-1 text-xs md:text-sm font-semibold"
                      tabIndex={-1}
                    >
                      Retake
                    </a>
                    <a
                      href={
                        quiz.quizId ? `/quiz/${quiz.quizId}/challenge` : "#"
                      }
                      className="px-3 py-1 rounded-full bg-pink-600/80 text-white hover:bg-pink-700 transition text-xs md:text-sm font-semibold"
                      tabIndex={-1}
                    >
                      Challenge
                    </a>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                        quiz.quizId && quiz.attemptId
                          ? "bg-green-600/80 text-white hover:bg-green-700 transition"
                          : "bg-gray-400/60 text-gray-200 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        quiz.quizId &&
                        quiz.attemptId &&
                        setScoreModal({
                          quizId: quiz.quizId,
                          attemptId: quiz.attemptId,
                        })
                      }
                      disabled={!quiz.quizId || !quiz.attemptId}
                      title={
                        !quiz.quizId || !quiz.attemptId
                          ? "Score unavailable for this quiz"
                          : "View Score"
                      }
                    >
                      View Score
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
      {/* Score Summary Modal */}
      <Modal open={!!scoreModal} onClose={() => setScoreModal(null)} wide>
        {scoreModal && (
          <div
            style={{
              height: "80vh",
              width: "90vw",
              maxWidth: "90vw",
              overflowY: "auto",
            }}
          >
            <ScoreSummaryModalContent
              quizId={scoreModal.quizId}
              attemptId={scoreModal.attemptId}
              onClose={() => setScoreModal(null)}
            />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
