"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spinner } from "@/components/ui/loading";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
      // If signIn doesn't redirect (e.g., popup closed), reset loading
      // Note: successful auth will redirect, so this might not execute
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      // Reset loading state after a delay in case redirect doesn't happen
      setTimeout(() => setIsLoading(false), 3000);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            QuizMania
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to continue your learning journey
          </p>
        </div>

        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" withGlow={false} />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <FcGoogle className="text-2xl" />
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
