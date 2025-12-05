"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || null;

  const errorMessages: Record<string, { title: string; description: string }> =
    {
      Configuration: {
        title: "Configuration Error",
        description:
          "There is a problem with the server configuration. Please contact support.",
      },
      AccessDenied: {
        title: "Access Denied",
        description: "You do not have permission to sign in.",
      },
      Verification: {
        title: "Verification Failed",
        description:
          "The verification token has expired or has already been used.",
      },
      OAuthSignin: {
        title: "OAuth Sign In Error",
        description:
          "Error occurred while trying to sign in with OAuth provider.",
      },
      OAuthCallback: {
        title: "OAuth Callback Error",
        description: "Error occurred during OAuth callback.",
      },
      OAuthCreateAccount: {
        title: "OAuth Account Creation Error",
        description: "Could not create OAuth account in the database.",
      },
      EmailCreateAccount: {
        title: "Email Account Creation Error",
        description: "Could not create email account in the database.",
      },
      Callback: {
        title: "Callback Error",
        description: "Error occurred in the OAuth callback handler.",
      },
      OAuthAccountNotLinked: {
        title: "Account Not Linked",
        description:
          "To confirm your identity, sign in with the same account you used originally.",
      },
      EmailSignin: {
        title: "Email Sign In Error",
        description: "The email sign in link is invalid or has expired.",
      },
      CredentialsSignin: {
        title: "Sign In Failed",
        description: "Sign in failed. Check your credentials and try again.",
      },
      SessionRequired: {
        title: "Session Required",
        description: "Please sign in to access this page.",
      },
      Default: {
        title: "Authentication Error",
        description: "An unexpected error occurred during authentication.",
      },
    };

  const errorInfo = (
    error && error in errorMessages
      ? errorMessages[error]
      : errorMessages.Default
  ) as { title: string; description: string };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <FiAlertCircle className="text-4xl text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {errorInfo.description}
          </p>
        </div>

        {error && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Error code:</span> {error}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            <FiArrowLeft />
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          If the problem persists, please contact support.
        </p>
      </motion.div>
    </div>
  );
}
