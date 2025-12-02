"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface ErrorCTA {
  label: string;
  href?: string;
  action?: string;
  primary: boolean;
}

interface ErrorConfig {
  code: string;
  title: string;
  message: string;
  accent: string;
  cta: ErrorCTA[];
  animation: string;
}

const ERROR_CONFIG: Record<string, ErrorConfig> = {
  "400": {
    code: "400",
    title: "Bad Request",
    message:
      "The request could not be understood. Please check your input and try again.",
    accent: "from-orange-900 via-red-900 to-orange-900",
    cta: [
      { label: "Go Back", action: "back", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/400.png",
  },
  "401": {
    code: "401",
    title: "Authentication Required",
    message:
      "You need to sign in to access this page. Please log in to continue.",
    accent: "from-yellow-900 via-orange-900 to-yellow-900",
    cta: [
      { label: "Sign In", href: "/auth/signin", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/401.png",
  },
  "403": {
    code: "403",
    title: "Access Forbidden",
    message:
      "You don't have permission to access this resource. Contact support if you believe this is a mistake.",
    accent: "from-red-900 via-pink-900 to-red-900",
    cta: [
      { label: "Go Home", href: "/", primary: true },
      { label: "Contact Support", href: "/about", primary: false },
    ],
    animation: "/Errors/403.png",
  },
  "404": {
    code: "404",
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist or has been moved.",
    accent: "from-slate-900 via-purple-900 to-slate-900",
    cta: [
      { label: "Go Home", href: "/", primary: true },
      { label: "Explore Quizzes", href: "/explore", primary: false },
    ],
    animation: "/Errors/404.png",
  },
  "405": {
    code: "405",
    title: "Method Not Allowed",
    message: "The request method is not supported for this resource.",
    accent: "from-indigo-900 via-blue-900 to-indigo-900",
    cta: [
      { label: "Go Back", action: "back", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/405.png",
  },
  "408": {
    code: "408",
    title: "Request Timeout",
    message: "The server timed out waiting for the request. Please try again.",
    accent: "from-cyan-900 via-teal-900 to-cyan-900",
    cta: [
      { label: "Try Again", action: "reload", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/408.png",
  },
  "409": {
    code: "409",
    title: "Conflict",
    message: "The request conflicts with the current state of the server.",
    accent: "from-amber-900 via-yellow-900 to-amber-900",
    cta: [
      { label: "Go Back", action: "back", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/409.png",
  },
  "429": {
    code: "429",
    title: "Too Many Requests",
    message:
      "You've made too many requests. Please slow down and try again in a moment.",
    accent: "from-rose-900 via-red-900 to-rose-900",
    cta: [
      { label: "Try Again Later", action: "reload", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/429.png",
  },
  "500": {
    code: "500",
    title: "Internal Server Error",
    message:
      "Something went wrong on our end. Our team has been notified and is working on a fix.",
    accent: "from-red-900 via-orange-900 to-red-900",
    cta: [
      { label: "Try Again", action: "reload", primary: true },
      { label: "Report Issue", action: "report", primary: false },
    ],
    animation: "/Errors/500.png",
  },
  "502": {
    code: "502",
    title: "Bad Gateway",
    message:
      "The server received an invalid response. Please try again in a moment.",
    accent: "from-violet-900 via-purple-900 to-violet-900",
    cta: [
      { label: "Try Again", action: "reload", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/502.png",
  },
  "503": {
    code: "503",
    title: "Service Unavailable",
    message:
      "The service is temporarily unavailable. We're working to restore it as quickly as possible.",
    accent: "from-fuchsia-900 via-pink-900 to-fuchsia-900",
    cta: [
      { label: "Try Again", action: "reload", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/503.png",
  },
  "504": {
    code: "504",
    title: "Gateway Timeout",
    message:
      "The server didn't respond in time. Please try your request again.",
    accent: "from-sky-900 via-blue-900 to-sky-900",
    cta: [
      { label: "Try Again", action: "reload", primary: true },
      { label: "Go Home", href: "/", primary: false },
    ],
    animation: "/Errors/504.png",
  },
};

function ErrorImage({ code, imagePath }: { code: string; imagePath: string }) {
  return (
    <div className="relative w-full aspect-4/3 max-w-2xl mb-8">
      <Image
        src={imagePath}
        alt={`Error ${code}`}
        fill
        className="object-contain drop-shadow-2xl"
        priority
      />
    </div>
  );
}

function ReportIssueModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Failed to submit report");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">
          Report Issue
        </h2>
        {submitted ? (
          <div className="text-green-600 dark:text-green-400">
            Thank you! Your report has been submitted.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              className="rounded border border-gray-300 dark:border-gray-700 p-2 min-h-20 resize-y bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              aria-label="Describe the issue"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="futuristic-button w-full">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ErrorPage() {
  const params = useParams();
  const router = useRouter();
  const status =
    params && Array.isArray(params.status)
      ? params.status[0]
      : params?.status || "404";
  const config =
    ERROR_CONFIG[status as keyof typeof ERROR_CONFIG] || ERROR_CONFIG["404"];
  const [showReport, setShowReport] = useState(false);

  if (!config) {
    return null;
  }

  function handleCTA(cta: ErrorCTA) {
    if (cta.action === "reload") {
      router.refresh();
    } else if (cta.action === "back") {
      router.back();
    } else if (cta.action === "report") {
      setShowReport(true);
    }
  }

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center bg-linear-to-br ${config.accent} px-4 py-8`}
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Logo/Header */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 hover:scale-105 transition-transform"
          aria-label="Go to homepage"
        >
          <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            QuizMania
          </span>
        </Link>

        {/* Error Image - Full Scale Responsive */}
        <ErrorImage code={config.code} imagePath={config.animation} />

        {/* Error Details */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-gray-300">
            {config.code}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {config.title}
          </h2>
          <p className="text-lg text-gray-200 max-w-xl px-4">
            {config.message}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          {config.cta.map((cta) =>
            cta.href ? (
              <Link
                key={cta.label}
                href={cta.href}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg ${
                  cta.primary
                    ? "bg-linear-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-purple-500/50"
                    : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20"
                }`}
                aria-label={cta.label}
              >
                {cta.label}
              </Link>
            ) : (
              <button
                key={cta.label}
                onClick={() => handleCTA(cta)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg ${
                  cta.primary
                    ? "bg-linear-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-purple-500/50"
                    : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20"
                }`}
                aria-label={cta.label}
              >
                {cta.label}
              </button>
            )
          )}
        </div>

        {/* Report Issue Modal for 500+ errors */}
        {(status === "500" ||
          status === "502" ||
          status === "503" ||
          status === "504") && (
          <ReportIssueModal
            open={showReport}
            onClose={() => setShowReport(false)}
          />
        )}
      </div>
    </main>
  );
}
