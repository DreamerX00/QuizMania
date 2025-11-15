import React from "react";
import { Crown, Zap } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import useSWR from "swr";
import Image from "next/image";
import {
  SiGithub,
  SiLinkedin,
  SiYoutube,
  SiDiscord,
  SiX,
} from "react-icons/si";
import { FiCopy, FiEdit2, FiShare2, FiPlus } from "react-icons/fi";
import { SkeletonCard } from "@/components/ui/loading";

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
  const { data, isLoading } = useSWR(
    user ? `/api/users/${user?.id}/profile` : null,
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
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
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
    return <SkeletonCard variant="profile" className="min-h-[220px]" />;
  }
  if (data?.error) {
    return (
      <div className="bg-linear-to-br from-[#1a1a2e] to-[#23234d] rounded-2xl p-6 shadow-2xl min-h-[220px] flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold mb-2">User Not Found</h2>
        <p className="mb-2">
          We couldn&apos;t find your user data. Try logging out and logging in
          again.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl shadow-2xl bg-white dark:bg-linear-to-br dark:from-[#181a2a] dark:to-[#23234d] border border-gray-200 dark:border-white/10 backdrop-blur-2xl flex flex-col items-center px-0 pt-0 pb-7 animate-fade-in hover:shadow-purple-500/20 transition-all duration-300">
      {/* Banner */}
      <div className="relative w-full h-28 md:h-36 flex items-center justify-center overflow-hidden rounded-t-2xl">
        {data.bannerUrl && data.bannerUrl !== "Not set" ? (
          <Image
            src={data.bannerUrl}
            alt="Banner"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 672px"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-purple-600 via-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          </div>
        )}
        {/* Upload Banner Button - always top right */}
        <button
          className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full shadow hover:bg-white/20 hover:scale-105 flex items-center gap-1 z-30 transition-all duration-200"
          onClick={openEdit}
        >
          <FiPlus size={10} /> Edit Banner
        </button>

        {/* Premium Badge */}
        {isPremiumActive && (
          <div className="absolute top-2 left-2 bg-linear-to-r from-yellow-400 to-orange-500 text-white px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 z-30 animate-pulse">
            <Crown className="w-3 h-3" />
            <span className="text-[10px] font-semibold">Premium</span>
          </div>
        )}

        {/* Animated orbs/particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-8 top-6 w-6 h-6 bg-blue-400/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute right-12 bottom-4 w-5 h-5 bg-purple-400/30 rounded-full blur-2xl animate-pulse delay-200" />
          <div className="absolute left-1/2 top-1/2 w-8 h-8 bg-pink-400/20 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
      </div>

      {/* Avatar - moved outside banner container */}
      <div className="absolute left-1/2 top-[84px] md:top-[108px] transform -translate-x-1/2 z-50">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-linear-to-br from-purple-500 to-blue-600 p-1 shadow-2xl relative flex items-center justify-center hover:scale-105 transition-transform duration-300">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-linear-to-br from-purple-400 to-blue-500">
            {data.avatarUrl !== "Not set" ? (
              <Image
                src={data.avatarUrl}
                alt="Avatar"
                fill
                className="object-cover border-3 border-white/20 shadow-lg rounded-full"
                sizes="(max-width: 768px) 112px, 128px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold bg-linear-to-br from-purple-500 to-blue-600">
                {data.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <button
            className="absolute bottom-1 right-1 bg-linear-to-br from-blue-600 to-purple-600 rounded-full p-1.5 shadow-lg hover:scale-110 transition z-50 border-2 border-white/30"
            onClick={handleAvatarUpload}
          >
            <FiEdit2 size={12} className="text-white" />
          </button>
        </div>
      </div>
      {/* Badges */}
      <div className="relative flex gap-2 mt-24 md:mt-25 mb-1.5 justify-center z-10">
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-200 font-bold text-[10px] shadow-glow uppercase tracking-wide">
          {data.role}
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-glow uppercase tracking-wide ${
            isPremiumActive
              ? "bg-linear-to-r from-yellow-400/20 to-orange-500/20 text-yellow-700 dark:text-yellow-200 animate-pulse"
              : "bg-purple-500/20 text-purple-700 dark:text-purple-200"
          }`}
        >
          {isPremiumActive ? "PREMIUM" : data.accountType}
        </span>
      </div>
      {/* Name & Email */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-center bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-1">
        {data.name}
      </h2>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-sm text-gray-600 dark:text-white/70 font-medium">
          {data.email}
        </span>
        <button
          className="text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/80 transition-colors"
          onClick={() => navigator.clipboard.writeText(data.email)}
          title="Copy email"
        >
          <FiCopy size={14} />
        </button>
      </div>
      {/* Stats */}
      <div className="flex gap-3 mb-3 justify-center">
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-xl px-3 py-1.5 shadow-inner backdrop-blur-sm min-w-14 sm:min-w-18 hover:scale-105 transition-transform duration-200">
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            {data.xp}
          </span>
          <span className="text-[10px] text-gray-600 dark:text-white/60 flex items-center gap-0.5">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" />
            XP
          </span>
        </div>
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-xl px-3 py-1.5 shadow-inner backdrop-blur-sm min-w-14 sm:min-w-18 hover:scale-105 transition-transform duration-200">
          <span className="text-base font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
            <Zap className="w-3 h-3" />
            {data.points || 0}
          </span>
          <span className="text-[10px] text-gray-600 dark:text-white/60">
            Points
          </span>
        </div>
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-xl px-3 py-1.5 shadow-inner backdrop-blur-sm min-w-14 sm:min-w-18 hover:scale-105 transition-transform duration-200">
          <span className="text-base font-bold text-purple-600 dark:text-purple-400">
            #{data.rank}
          </span>
          <span className="text-[10px] text-gray-600 dark:text-white/60 flex items-center gap-0.5">
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full" />
            Rank
          </span>
        </div>
        <div className="flex flex-col items-center bg-gray-100 dark:bg-white/10 rounded-xl px-3 py-1.5 shadow-inner backdrop-blur-sm min-w-14 sm:min-w-18 hover:scale-105 transition-transform duration-200">
          <span className="text-base font-bold text-pink-600 dark:text-pink-400">
            🔥 {data.streak}
          </span>
          <span className="text-[10px] text-gray-600 dark:text-white/60">
            Streak
          </span>
        </div>
      </div>

      {/* Premium Status */}
      {isPremiumActive && data.premiumUntil && (
        <div className="mb-4 px-4 py-2 bg-linear-to-r from-yellow-400/10 to-orange-500/10 rounded-xl border border-yellow-400/20">
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
          className="futuristic-button px-5 py-2 text-base font-semibold flex items-center gap-2 rounded-2xl shadow-glow bg-linear-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200"
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
