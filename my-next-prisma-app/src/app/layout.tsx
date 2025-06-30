import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import QuizManiaNavbar from "../../components/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Suspense } from "react";
import { FloatingDock } from "../../components/ui/floating-dock";
import { Brain, Zap, Sparkles, Trophy, Users } from 'lucide-react';
import ClickSpark from "@/components/ClickSpark";
import QueryProvider from "@/components/providers/QueryProvider";
import WebVitals from "@/components/WebVitals";

// Optimized font loading
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

const orbitron = Orbitron({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-orbitron',
});

export const metadata: Metadata = {
  title: "QuizMania - Interactive Quiz Platform",
  description: "Create, take, and share interactive quizzes with AI-powered generation",
  keywords: ["quiz", "education", "learning", "interactive", "AI", "gamification"],
  authors: [{ name: "QuizMania Team" }],
  openGraph: {
    title: "QuizMania - Interactive Quiz Platform",
    description: "Create, take, and share interactive quizzes with AI-powered generation",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuizMania - Interactive Quiz Platform",
    description: "Create, take, and share interactive quizzes with AI-powered generation",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const dockItems = [
  { title: 'Home', icon: <Sparkles className="w-6 h-6" />, href: '/' },
  { title: 'Explore', icon: <Zap className="w-6 h-6" />, href: '/explore' },
  { title: 'Create', icon: <Brain className="w-6 h-6" />, href: '/create-quiz/guide' },
  { title: 'Leaderboard', icon: <Trophy className="w-6 h-6" />, href: '/leaderboard' },
  { title: 'Profile', icon: <Users className="w-6 h-6" />, href: '/profile' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} ${inter.className}`} suppressHydrationWarning>
        <ClerkProvider>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>
                <WebVitals />
                <ClickSpark
                  sparkColor="#3b82f6"
                  sparkSize={8}
                  sparkRadius={20}
                  sparkCount={6}
                  duration={500}
                  easing="ease-out"
                  extraScale={1.2}
                >
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="hidden md:block">
                      <QuizManiaNavbar />
                    </div>
                    <FloatingDock items={dockItems} />
                    <main className="pt-0">
                      <Suspense fallback={<LoadingSpinner />}>
                      {children}
                      </Suspense>
                    </main>
                  </div>
                </ClickSpark>
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
