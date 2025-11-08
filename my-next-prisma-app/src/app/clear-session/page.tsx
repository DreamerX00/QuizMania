"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClearSessionPage() {
  const [status, setStatus] = useState<"clearing" | "success" | "error">(
    "clearing"
  );
  const [message, setMessage] = useState("Clearing old session data...");
  const router = useRouter();

  useEffect(() => {
    async function clearSession() {
      try {
        const response = await fetch("/api/auth/clear-sessions");
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message);

          // Redirect to sign-in after 2 seconds
          setTimeout(() => {
            router.push("/auth/signin");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Failed to clear sessions. Please try manually.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          "An error occurred. Please clear your browser cookies manually."
        );
        console.error("Error clearing sessions:", error);
      }
    }

    clearSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          {status === "clearing" && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Clearing Sessions
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="rounded-full h-16 w-16 bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sessions Cleared!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to sign-in page...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="rounded-full h-16 w-16 bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-10 w-10 text-red-600 dark:text-red-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Error Clearing Sessions
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                  Manual Steps:
                </h3>
                <ol className="text-sm text-left text-yellow-800 dark:text-yellow-300 space-y-1">
                  <li>1. Open DevTools (F12)</li>
                  <li>2. Go to Application {">"} Cookies</li>
                  <li>3. Delete all localhost:3000 cookies</li>
                  <li>4. Clear Local Storage</li>
                  <li>5. Refresh the page</li>
                </ol>
              </div>

              <button
                onClick={() => router.push("/auth/signin")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Go to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

