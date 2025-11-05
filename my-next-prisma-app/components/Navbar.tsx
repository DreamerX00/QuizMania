"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "../src/context/ThemeContext";
import {
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import { Brain, Sun, Moon, Sparkles, Zap } from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "./ui/resizable-navbar";
import { AnimatedThemeToggle } from "./ui/AnimatedThemeToggle";

export default function QuizManiaNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const navItems = [
    { name: "Home", link: "/", icon: Sparkles },
    { name: "Explore", link: "/explore", icon: Zap },
    { name: "About", link: "/about", icon: Sparkles },
  ];

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center space-x-3">
          {/* Animated Theme Toggle */}
          <AnimatedThemeToggle />

          {/* User Menu */}
          <SignedIn>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="focus:outline-none relative w-9 h-9"
              >
                <Image
                  src={user?.imageUrl || "/default_avatar.png"}
                  alt="Profile"
                  fill
                  className="rounded-full border-2 border-white/20 shadow cursor-pointer hover:scale-105 transition object-cover"
                  sizes="36px"
                  priority
                />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/profile");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/user");
                    }}
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center space-x-2">
              <NavbarButton href="/login" variant="secondary">
                Login
              </NavbarButton>
              <NavbarButton href="/signup" variant="gradient">
                Sign Up
              </NavbarButton>
            </div>
          </SignedOut>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center space-x-3">
            {/* Animated Theme Toggle */}
            <AnimatedThemeToggle />

            {/* User Menu */}
            <SignedIn>
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="focus:outline-none relative w-9 h-9"
                >
                  <Image
                    src={user?.imageUrl || "/default_avatar.png"}
                    alt="Profile"
                    fill
                    className="rounded-full border-2 border-white/20 shadow cursor-pointer hover:scale-105 transition object-cover"
                    sizes="36px"
                    priority
                  />
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        router.push("/profile");
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        router.push("/user");
                      }}
                    >
                      Account Settings
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setProfileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center space-x-2">
                <NavbarButton href="/login" variant="secondary">
                  Login
                </NavbarButton>
                <NavbarButton href="/signup" variant="gradient">
                  Sign Up
                </NavbarButton>
              </div>
            </SignedOut>

            <MobileNavToggle
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
          <div className="space-y-2">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.link}
                  href={item.link}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all duration-300"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            <SignedOut>
              <div className="pt-4 border-t border-gray-200 dark:border-neutral-700 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg bg-gradient-to-b from-purple-500 to-blue-600 text-white text-center font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all duration-300"
              >
                <div className="relative w-8 h-8">
                  <Image
                    src={user?.imageUrl || "/default_avatar.png"}
                    alt="Profile"
                    fill
                    className="rounded-full border-2 border-white/20 shadow cursor-pointer hover:scale-105 transition object-cover"
                    sizes="32px"
                  />
                </div>
                <span className="font-medium">Profile</span>
              </Link>
            </SignedIn>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
