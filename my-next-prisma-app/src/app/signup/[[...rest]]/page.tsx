"use client";
import { SignUp } from "@clerk/nextjs";
import { useTheme } from "@/context/ThemeContext";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-blue-900 dark:from-black dark:to-gray-900 py-6 sm:py-12 px-2 sm:px-4">
      <SignUp
        appearance={{
          baseTheme: theme === 'dark' ? dark : undefined,
          elements: {
            card: "bg-gray-900/80 rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-white/10",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "bg-gray-800 hover:bg-gray-700 text-white",
            dividerText: "text-gray-500",
            footerActionText: "text-gray-400",
            footerActionLink: "text-blue-400 hover:text-blue-300",
            formFieldInput: "bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none",
            formFieldLabel: "text-white/80",
            formFieldInputShowPasswordButton: "text-blue-300 hover:text-blue-500",
            formFieldInputHidePasswordButton: "text-blue-300 hover:text-blue-500",
            formFieldErrorText: "text-red-500",
          },
        }}
        routing="path"
        path="/signup"
      />
    </div>
  );
} 