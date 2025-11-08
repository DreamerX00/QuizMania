"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiInfo } from "react-icons/fi";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimationGeneratorType } from "framer-motion";
import { Howl } from "howler";

const BUTTON_CLICK_SOUND = "/button_sound.wav"; // Updated to use button_sound.wav from public folder

const buttonClickHowl = new Howl({ src: [BUTTON_CLICK_SOUND], volume: 0.5 });

export default function CreateQuizGuidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const userId = session?.user?.id;

  // Sparkle positions (client only, stable after hydration)
  const [sparkles, setSparkles] = useState<
    | {
        top: number;
        left: number;
        opacity: number;
        duration: number;
        delay: number;
      }[]
    | null
  >(null);
  useEffect(() => {
    setSparkles(
      [...Array(40)].map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.7 + 0.2,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.replace("/auth/signin");
      return;
    }
    const id = searchParams ? searchParams.get("id") : null;
    if (id) {
      router.replace(`/create-quiz?id=${id}`);
    }
  }, [isLoaded, userId, searchParams, router]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, type: "spring" as AnimationGeneratorType },
    },
  };
  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const QUESTION_TYPES = [
    {
      id: "mcq-single",
      name: "MCQ (Single)",
      icon: "🔘",
      guide: "Multiple choice, one correct answer.",
    },
    {
      id: "mcq-multiple",
      name: "MCQ (Multiple)",
      icon: "☑️",
      guide: "Multiple choice, multiple correct answers.",
    },
    {
      id: "true-false",
      name: "True/False",
      icon: "✅",
      guide: "Simple true or false question.",
    },
    {
      id: "match",
      name: "Match Following",
      icon: "🔗",
      guide: "Match items from two columns.",
    },
    {
      id: "matrix",
      name: "Matrix",
      icon: "📊",
      guide: "Grid-based, select answers in a matrix.",
    },
    {
      id: "poll",
      name: "Poll",
      icon: "📈",
      guide: "Survey-style, no correct answer.",
    },
    {
      id: "paragraph",
      name: "Paragraph",
      icon: "📝",
      guide: "Short answer, manual grading.",
    },
    {
      id: "fill-blanks",
      name: "Fill Blanks",
      icon: "⬜",
      guide: "Fill in the blanks in text.",
    },
    {
      id: "code-output",
      name: "Code Output",
      icon: "💻",
      guide: "Predict output of code.",
    },
    {
      id: "drag-drop",
      name: "Drag & Drop",
      icon: "🖱️",
      guide: "Arrange items by dragging.",
    },
    {
      id: "image-based",
      name: "Image Based",
      icon: "🖼️",
      guide: "Answer based on an image.",
    },
    { id: "audio", name: "Audio", icon: "🎵", guide: "Answer based on audio." },
    { id: "video", name: "Video", icon: "🎬", guide: "Answer based on video." },
    {
      id: "essay",
      name: "Essay",
      icon: "✍️",
      guide: "Long-form, manual grading.",
    },
    {
      id: "ordering",
      name: "Ordering",
      icon: "📋",
      guide: "Arrange items in order.",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-background to-white dark:from-[#0f1021] dark:via-[#23234d] dark:to-[#1a1a2e] py-12 px-4">
      {/* Animated Orbs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-linear-to-br from-purple-500/30 to-blue-600/30 rounded-full blur-3xl animate-float z-0"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute top-1/2 right-0 w-72 h-72 bg-linear-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-2xl animate-float z-0"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-60 h-60 bg-linear-to-br from-yellow-500/20 to-orange-600/20 rounded-full blur-2xl animate-float z-0"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          repeatType: "mirror",
          delay: 4,
        }}
      />
      {/* Subtle Sparkle/Starfield Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {sparkles &&
          sparkles.map((s, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/60"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                opacity: s.opacity,
              }}
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                repeatType: "mirror",
                delay: s.delay,
              }}
            />
          ))}
      </div>
      {/* Main Card */}
      <motion.div
        className="relative max-w-2xl w-full bg-white/90 text-blue-900 dark:bg-gray-900/80 dark:text-cyan-100 rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-400/30 ring-2 ring-cyan-400/20 ring-offset-2 ring-offset-blue-900/30 z-10"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-extrabold text-blue-900 dark:text-cyan-300 mb-4 text-center drop-shadow-glow"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to the Quiz Builder!
        </motion.h1>
        <motion.p
          className="text-muted-foreground dark:text-cyan-100 mb-6 text-center text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Create interactive quizzes with a variety of question types.
          <br />
          Save drafts, use templates, and publish your quizzes for others to
          explore!
        </motion.p>
        {/* Animated Info Box */}
        <motion.div
          className="flex items-center gap-3 bg-blue-100 border border-blue-300 text-blue-900 dark:bg-cyan-800/40 dark:border-cyan-400/30 dark:text-cyan-100 rounded-xl px-4 py-3 mb-6 shadow-lg animate-pulse-glow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <FiInfo className="text-cyan-300 text-2xl animate-spin-slow" />
          <span className="text-cyan-100 font-medium">
            Tip: You can import questions from templates or use AI to generate
            questions instantly!
          </span>
        </motion.div>
        <ol className="list-decimal list-inside text-blue-800 dark:text-cyan-200 mb-6 space-y-2 text-base">
          <li>
            <b>Set Quiz Details:</b> Add a title, tags, and (optionally) a cover
            image.
          </li>
          <li>
            <b>Add Questions:</b> Choose from many question types. Click
            &quot;Add Question&quot; and select a type to begin.
          </li>
          <li>
            <b>Edit & Validate:</b> Fill in question details. The builder will
            guide you if anything is missing or invalid.
          </li>
          <li>
            <b>Use Templates:</b> Import questions from your own or public
            templates to save time.
          </li>
          <li>
            <b>Finalize & Publish:</b> When ready, finalize your quiz and
            publish it to make it available to others.
          </li>
        </ol>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-cyan-200 mb-2">
            Supported Question Types
          </h2>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {QUESTION_TYPES.map((type, idx) => (
              <motion.div
                key={type.id}
                className="flex flex-col items-start gap-1 bg-blue-50 border border-blue-200 text-blue-900 dark:bg-cyan-900/60 dark:border-cyan-400/10 dark:text-cyan-100 rounded-xl px-4 py-3 shadow-lg hover:scale-105 hover:shadow-cyan-400/30 transition-transform duration-300 cursor-pointer group"
                whileHover={{ scale: 1.08, boxShadow: "0 0 16px #22d3ee55" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.07 + 0.5 }}
                tabIndex={0}
                aria-label={type.name}
              >
                <span
                  className="text-3xl drop-shadow-glow group-hover:animate-bounce"
                  aria-label={`${type.name} icon`}
                >
                  {type.icon}
                </span>
                <span className="text-blue-900 dark:text-cyan-100 font-semibold text-lg">
                  {type.name}
                </span>
                <span className="text-blue-800 dark:text-cyan-200 text-sm">
                  {type.guide}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        {/* Animated Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-800 text-cyan-200 hover:bg-cyan-700 transition font-semibold shadow-md border border-cyan-400/20"
              whileHover={{ scale: 1.07, boxShadow: "0 0 12px #22d3ee55" }}
            >
              <FiArrowLeft /> Go Back Home
            </motion.button>
          </Link>
          <Link href="/create-quiz">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 transition font-semibold shadow-lg border-2 border-cyan-300 animate-pulse-glow"
              whileHover={{ scale: 1.12, boxShadow: "0 0 24px #22d3ee99" }}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                repeatType: "mirror",
              }}
              onClick={() => buttonClickHowl.play()}
            >
              Start Building <FiArrowRight />
            </motion.button>
          </Link>
        </div>
      </motion.div>
      {/* Custom CSS for glow and slow spin */}
      <style jsx global>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px #22d3ee88);
        }
        .animate-pulse-glow {
          animation: pulse-glow 2.5s infinite alternate;
        }
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 16px #22d3ee44, 0 0 0 #fff0;
          }
          100% {
            box-shadow: 0 0 32px #22d3ee99, 0 0 8px #fff2;
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-20px);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

