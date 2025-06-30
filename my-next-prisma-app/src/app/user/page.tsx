"use client";
import { UserProfile } from '@clerk/nextjs';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { dark } from '@clerk/themes';

export default function UserAccountPage() {
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white relative overflow-x-hidden pt-16 md:pt-20">
      {/* Floating Orbs for visual appeal */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-purple-500/10 to-blue-600/10 dark:from-purple-500/30 dark:to-blue-600/30 rounded-full blur-3xl animate-float z-0" />
      <div className="absolute top-1/2 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-600/10 dark:from-blue-500/30 dark:to-purple-600/30 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 dark:from-yellow-500/20 dark:to-orange-600/20 rounded-full blur-2xl animate-float z-0" style={{ animationDelay: '4s' }} />
      
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] p-2 sm:p-6">
        <UserProfile
          routing="hash"
          appearance={{
            baseTheme: isDark ? dark : undefined,
            elements: {
              card: isDark 
                ? "bg-gradient-to-br from-[#1a1a2e] to-[#23234d] rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-white/10"
                : "bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-gray-200",
              formButtonPrimary: isDark
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200",
              headerTitle: isDark ? "text-white" : "text-gray-900",
              headerSubtitle: isDark ? "text-gray-400" : "text-gray-600",
              socialButtonsBlockButton: isDark
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg transition-all duration-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 rounded-lg transition-all duration-200",
              dividerText: isDark ? "text-gray-500" : "text-gray-400",
              footerActionText: isDark ? "text-gray-400" : "text-gray-600",
              footerActionLink: isDark 
                ? "text-blue-400 hover:text-blue-300 transition-colors duration-200"
                : "text-blue-600 hover:text-blue-700 transition-colors duration-200",
              formFieldInput: isDark
                ? "bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg transition-all duration-200"
                : "bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg transition-all duration-200",
              formFieldLabel: isDark ? "text-white/80" : "text-gray-700",
              formFieldInputShowPasswordButton: isDark 
                ? "text-blue-300 hover:text-blue-500 transition-colors duration-200"
                : "text-blue-600 hover:text-blue-800 transition-colors duration-200",
              formFieldInputHidePasswordButton: isDark 
                ? "text-blue-300 hover:text-blue-500 transition-colors duration-200"
                : "text-blue-600 hover:text-blue-800 transition-colors duration-200",
              formFieldErrorText: "text-red-500",
              formResendCodeLink: isDark 
                ? "text-blue-400 hover:text-blue-300 transition-colors duration-200"
                : "text-blue-600 hover:text-blue-700 transition-colors duration-200",
              formFieldAction: isDark 
                ? "text-blue-400 hover:text-blue-300 transition-colors duration-200"
                : "text-blue-600 hover:text-blue-700 transition-colors duration-200",
              alertText: isDark ? "text-gray-300" : "text-gray-700",
              alert: isDark 
                ? "bg-gray-800 border border-gray-700 rounded-lg"
                : "bg-gray-50 border border-gray-300 rounded-lg",
            },
          }}
        />
      </div>
    </main>
  );
} 