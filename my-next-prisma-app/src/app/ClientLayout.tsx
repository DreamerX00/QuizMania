"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import QuizManiaNavbar from "../../components/Navbar";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Brain, Zap, Sparkles, Trophy, Users } from "lucide-react";
import ClickSpark from "@/components/ClickSpark";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/components/providers/QueryProvider";
import WebVitals from "@/components/WebVitals";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { NavbarButton } from "../../components/ui/resizable-navbar";
import { AnimatedThemeToggle } from "../../components/ui/AnimatedThemeToggle";
import { useSession } from "next-auth/react";

// Helper component for signed-out buttons
function SignedOutButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (session) return null;

  return (
    <>
      <NavbarButton href="/auth/signin" variant="secondary">
        Login
      </NavbarButton>
      <NavbarButton href="/auth/signin" variant="gradient">
        Sign Up
      </NavbarButton>
    </>
  );
}

const dockItems = [
  { title: "Home", icon: <Sparkles className="w-6 h-6" />, href: "/" },
  {
    title: "Explore",
    icon: <Zap className="w-6 h-6" />,
    href: "/explore",
    restricted: true,
  },
  {
    title: "Create",
    icon: <Brain className="w-6 h-6" />,
    href: "/create-quiz/guide",
    restricted: true,
  },
  {
    title: "Leaderboard",
    icon: <Trophy className="w-6 h-6" />,
    href: "/leaderboard",
    restricted: true,
  },
  {
    title: "Profile",
    icon: <Users className="w-6 h-6" />,
    href: "/profile",
    restricted: true,
  },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isArenaPage =
    (pathname?.startsWith("/quiz/") && pathname?.includes("/take")) ||
    pathname === "/multiplayer-arena";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider>
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
                {/* Mobile Top Bar: Theme toggle always visible, login/signup for signed-out users */}
                {!isArenaPage && (
                  <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-end gap-2 p-3 bg-background/80 backdrop-blur-md md:hidden">
                    <div className="mr-auto">
                      <AnimatedThemeToggle />
                    </div>
                    <SignedOutButtons />
                  </div>
                )}
                {/* ❌ Hide global nav & dock in Arena */}
                {!isArenaPage && (
                  <div className="hidden md:block z-50 relative">
                    <QuizManiaNavbar />
                  </div>
                )}

                {/* FloatingDock: Only render after mount to avoid hydration mismatch */}
                {!isArenaPage && mounted && (
                  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto block md:hidden justify-center z-40 mx-auto">
                    <FloatingDock items={dockItems} />
                  </div>
                )}

                <main className="pt-0">
                  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
                </main>

                <Toaster
                  position="top-right"
                  toastOptions={{ duration: 3500 }}
                />
              </div>
            </ClickSpark>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
