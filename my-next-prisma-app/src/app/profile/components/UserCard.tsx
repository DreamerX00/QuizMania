import React, { memo } from "react";
import { motion } from "framer-motion";
import { LucideUser, Crown, Zap } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import useSWR from "swr";
import { AccountSettings } from "./AccountSettings";
import Image from "next/image";
import {
  SiGithub,
  SiLinkedin,
  SiYoutube,
  SiDiscord,
  SiX,
} from "react-icons/si";
import { FiCopy, FiEdit2, FiShare2, FiPlus } from "react-icons/fi";

const Badge = memo(function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary";
}) {
  const base =
    "inline-block px-2 py-0.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm";
  const color =
    variant === "secondary"
      ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white border border-blue-400/40"
      : "bg-gradient-to-r from-purple-500 to-blue-600 text-white border border-purple-400/40";
  return <span className={`${base} ${color} animate-glow`}>{children}</span>;
});

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) =>
    res.json()
  );

function getSocialUrl(type: string, value: string) {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  switch (type) {
    case "twitter":
      return `https://twitter.com/${value.replace("@", "")}`;
    case "discord":
      return `https://discord.com/users/${value}`;
    case "github":
      return `https://github.com/${value}`;
    case "linkedin":
      return `https://linkedin.com/in/${value}`;
    case "youtube":
      return `https://youtube.com/${value}`;
    default:
      return value;
  }
}

export function UserCard({
  openEdit,
  openEditSocials,
  mutateProfile,
}: {
  openEdit: () => void;
  openEditSocials: () => void;
  mutateProfile: () => void;
}) {
  const { user } = useAuth();
  const { data, isLoading, mutate } = useSWR(
    user ? `/api/users/${user.id}/profile` : null,
    (url) => fetch(url).then((res) => res.json())
  );

  // Parse socials data
  const socials = React.useMemo(() => {
    if (!data?.socials) return {};
    try {
      if (typeof data.socials === "string") {
        return JSON.parse(data.socials);
      }
      return data.socials;
    } catch {
      return {};
    }
  }, [data?.socials]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Profile link copied!");
  };
  const handleAvatarUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      // Simulate upload: in real app, upload to server or cloud storage
      alert("Avatar uploaded! (Simulated)");
      mutateProfile();
    };
    input.click();
  };

  // Check if user is premium
  const isPremium =
    data?.accountType === "PREMIUM" || data?.accountType === "LIFETIME";
  const isPremiumActive =
    isPremium &&
    (!data?.premiumUntil || new Date(data.premiumUntil) > new Date());

  if (isLoading || !data) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#23234d] rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[220px]" />
    );
  }
  if (data?.error) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#23234d] rounded-2xl p-6 shadow-2xl min-h-[220px] flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold mb-2">User Not Found</h2>
        <p className="mb-2">
          We couldn't find your user data. Try logging out and logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gradient-to-br dark:from-[#181a2a] dark:to-[#23234d] border border-gray-200 dark:border-white/10 backdrop-blur-2xl flex flex-col items-center px-0 pt-0 pb-8 animate-fade-in">
      {/* Banner */}
      <div className="relative w-full h-32 md:h-40 flex items-center justify-center bg-gradient-to-r from-purple-700/60 to-blue-700/60">
        {data.bannerUrl && data.bannerUrl !== "Not set" ? (
          <Image
            src={data.bannerUrl}
            alt="Banner"
            fill
            className="object-cover object-center opacity-90"
            sizes="(max-width: 768px) 100vw, 672px"
            priority={false}
          />
        ) : (
          <Image
            src="https://landing.moqups.com/img/blog/1.-Hero-Image.png"
            alt=""
            fill
            className="object-cover object-center opacity-80"
            sizes="(max-width: 768px) 100vw, 672px"
            priority={false}
          />
        )}
        {/* Upload Banner Button - always top right */}
        <button
          className="absolute top-3 right-3 bg-white/10 text-white text-xs px-3 py-1 rounded-full shadow hover:bg-white/20 flex items-center gap-1 z-30"
          onClick={openEdit}
        >
          <FiPlus /> Edit Banner URL
        </button>

        {/* Premium Badge */}
        {isPremiumActive && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-30">
            <Crown className="w-3 h-3" />
            <span className="text-xs font-semibold">Premium</span>
          </div>
        )}

        {/* Animated orbs/particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-8 top-6 w-8 h-8 bg-blue-400/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute right-12 bottom-4 w-6 h-6 bg-purple-400/30 rounded-full blur-2xl animate-pulse delay-200" />
        </div>
        {/* Avatar */}
        <div className="absolute left-1/2 -bottom-14 transform -translate-x-1/2 z-20">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 p-1 shadow-2xl animate-glow relative flex items-center justify-center">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={
                  data.avatarUrl !== "Not set"
                    ? data.avatarUrl
                    : "https://icon2.cleanpng.com/20180529/bxp/avpqkaq1b.webp"
                }
                alt="Avatar"
                fill
                className="object-cover border-4 border-white/20 shadow-lg rounded-full"
                sizes="(max-width: 768px) 112px, 144px"
                priority
              />
            </div>
            <button
              className="absolute bottom-2 right-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-2 shadow-lg hover:scale-110 transition z-20 border-2 border-white/30"
              onClick={handleAvatarUpload}
            >
              <FiEdit2 size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
      {/* Badges */}
      <div className="flex gap-2 mt-20 mb-2 justify-center">
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-200 font-bold text-xs shadow-glow uppercase tracking-wide animate-glow">
          {data.role}
        </span>
        <span
          className={`px-3 py-1 rounded-full font-bold text-xs shadow-glow uppercase tracking-wide animate-glow ${
            isPremiumActive
              ? "bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-700 dark:text-yellow-200"
              : "bg-purple-500/20 text-purple-700 dark:text-purple-200"
          }`}
        >
          {isPremiumActive ? "PREMIUM" : data.accountType}
        </span>
      </div>
      {/* Name & Email */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-move mb-1">
        {data.name}
      </h2>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-base text-gray-600 dark:text-white/70 font-medium">
          {data.email}
        </span>
        <button
          className="text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/80"
          onClick={() => navigator.clipboard.writeText(data.email)}
          title="Copy email"
        >
          <FiCopy size={16} />
        </button>
      </div>
      {/* Stats */}
      <div className="flex gap-4 mb-4 justify-center">
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-2xl px-4 py-2 shadow-inner backdrop-blur-sm min-w-16 sm:min-w-20">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 drop-shadow-glow">
            {data.xp}
          </span>
          <span className="text-xs text-gray-600 dark:text-white/60 flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-blue-400 rounded-full" />
            XP
          </span>
        </div>
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-2xl px-4 py-2 shadow-inner backdrop-blur-sm min-w-16 sm:min-w-20">
          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400 drop-shadow-glow flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {data.points || 0}
          </span>
          <span className="text-xs text-gray-600 dark:text-white/60">
            Points
          </span>
        </div>
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-2xl px-4 py-2 shadow-inner backdrop-blur-sm min-w-16 sm:min-w-20">
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400 drop-shadow-glow">
            #{data.rank}
          </span>
          <span className="text-xs text-gray-600 dark:text-white/60 flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-purple-400 rounded-full" />
            Rank
          </span>
        </div>
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-2xl px-4 py-2 shadow-inner backdrop-blur-sm min-w-16 sm:min-w-20">
          <span className="text-lg font-bold text-pink-600 dark:text-pink-400 drop-shadow-glow">
            🔥 {data.streak}
          </span>
          <span className="text-xs text-gray-600 dark:text-white/60">
            Streak
          </span>
        </div>
      </div>

      {/* Premium Status */}
      {isPremiumActive && data.premiumUntil && (
        <div className="mb-4 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-xl border border-yellow-400/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                Premium Active
              </span>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Until {new Date(data.premiumUntil).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Profile Info Pills */}
      <div className="flex flex-wrap gap-3 justify-center w-full mb-2">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 rounded-full px-4 py-1 shadow-inner backdrop-blur-sm min-w-20 sm:min-w-24">
          <span className="text-xs text-gray-600 dark:text-white/60 font-semibold">
            Alias
          </span>
          <span className="text-sm text-gray-900 dark:text-white font-medium">
            {data.alias}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 rounded-full px-4 py-1 shadow-inner backdrop-blur-sm min-w-20 sm:min-w-24">
          <span className="text-xs text-gray-600 dark:text-white/60 font-semibold">
            Region
          </span>
          <span className="text-lg">🌐</span>
          <span className="text-sm text-gray-900 dark:text-white font-medium">
            {data.region}
          </span>
        </div>
      </div>
      {/* Socials */}
      <div className="flex flex-col items-center w-full mb-3">
        <span className="font-semibold text-gray-600 dark:text-white/60 text-xs mb-1 text-center w-full">
          Socials
        </span>
        <div className="flex items-center gap-4 justify-center w-full">
          {/* X (Twitter) */}
          {socials.twitter ? (
            <a
              href={getSocialUrl("twitter", socials.twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 hover:bg-blue-500/30 transition shadow-glow"
            >
              <SiX className="text-blue-600 dark:text-blue-400 text-xl" />
            </a>
          ) : (
            <button
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 opacity-40 hover:opacity-70 transition shadow-glow"
              onClick={openEditSocials}
              title="Add X (Twitter)"
            >
              <SiX className="text-xl" />
            </button>
          )}
          {/* Discord */}
          {socials.discord ? (
            <a
              href={getSocialUrl("discord", socials.discord)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 hover:bg-indigo-500/30 transition shadow-glow"
            >
              <SiDiscord className="text-indigo-600 dark:text-indigo-400 text-xl" />
            </a>
          ) : (
            <button
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 opacity-40 hover:opacity-70 transition shadow-glow"
              onClick={openEditSocials}
              title="Add Discord"
            >
              <SiDiscord className="text-xl" />
            </button>
          )}
          {/* GitHub */}
          {socials.github ? (
            <a
              href={getSocialUrl("github", socials.github)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 hover:bg-gray-400/30 transition shadow-glow"
            >
              <SiGithub className="text-gray-700 dark:text-gray-300 text-xl" />
            </a>
          ) : (
            <button
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 opacity-40 hover:opacity-70 transition shadow-glow"
              onClick={openEditSocials}
              title="Add GitHub"
            >
              <SiGithub className="text-xl" />
            </button>
          )}
          {/* LinkedIn */}
          {socials.linkedin ? (
            <a
              href={getSocialUrl("linkedin", socials.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 hover:bg-blue-500/30 transition shadow-glow"
            >
              <SiLinkedin className="text-blue-600 dark:text-blue-400 text-xl" />
            </a>
          ) : (
            <button
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 opacity-40 hover:opacity-70 transition shadow-glow"
              onClick={openEditSocials}
              title="Add LinkedIn"
            >
              <SiLinkedin className="text-xl" />
            </button>
          )}
          {/* YouTube */}
          {socials.youtube ? (
            <a
              href={getSocialUrl("youtube", socials.youtube)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 hover:bg-red-500/30 transition shadow-glow"
            >
              <SiYoutube className="text-red-600 dark:text-red-400 text-xl" />
            </a>
          ) : (
            <button
              className="bg-gray-100 dark:bg-white/10 rounded-full p-3 opacity-40 hover:opacity-70 transition shadow-glow"
              onClick={openEditSocials}
              title="Add YouTube"
            >
              <SiYoutube className="text-xl" />
            </button>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-3 w-full justify-center">
        <button
          className="futuristic-button px-5 py-2 text-base font-semibold flex items-center gap-2 rounded-2xl shadow-glow bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200"
          onClick={openEdit}
        >
          <FiEdit2 /> Edit Profile
        </button>
        <button
          className="px-5 py-2 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white font-semibold flex items-center gap-2 shadow-glow hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-200"
          onClick={handleShare}
        >
          <FiShare2 /> Share
        </button>
      </div>
    </div>
  );
}

// Animations and styles for glassmorphism, glow, and futuristic look
// Add these to your global CSS or Tailwind config:
// .animate-glow { box-shadow: 0 0 16px 4px #a78bfa33, 0 0 32px 8px #60a5fa22; animation: glow 2s infinite alternate; }
// .futuristic-title { letter-spacing: 0.03em; }
// .futuristic-button { background: linear-gradient(90deg, #7f5af0 0%, #2cb1ff 100%); color: #fff; border-radius: 9999px; box-shadow: 0 2px 16px #7f5af055; transition: background 0.3s; }
// .futuristic-button:hover { background: linear-gradient(90deg, #2cb1ff 0%, #7f5af0 100%); }
// .animate-gradient-move { background-size: 200% 200%; animation: gradientMove 3s linear infinite; }
// @keyframes gradientMove { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
// .drop-shadow-glow { filter: drop-shadow(0 0 8px #7f5af0aa); }
// .animate-float { animation: float 6s ease-in-out infinite; }
// @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
