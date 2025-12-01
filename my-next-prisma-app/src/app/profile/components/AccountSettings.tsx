import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import {
  SiGithub,
  SiLinkedin,
  SiYoutube,
  SiDiscord,
  SiX,
} from "react-icons/si";
import {
  FiUser,
  FiGlobe,
  FiImage,
  FiX,
  FiLoader,
  FiEdit2,
} from "react-icons/fi";

const SOCIALS = [
  {
    name: "twitter",
    icon: <SiX className="text-blue-400" />,
    placeholder: "e.g. @username or full URL",
  },
  {
    name: "discord",
    icon: <SiDiscord className="text-indigo-400" />,
    placeholder: "e.g. username#1234 or full URL",
  },
  {
    name: "github",
    icon: <SiGithub className="text-gray-300" />,
    placeholder: "e.g. username or full URL",
  },
  {
    name: "linkedin",
    icon: <SiLinkedin className="text-blue-500" />,
    placeholder: "e.g. profile-url or full URL",
  },
  {
    name: "youtube",
    icon: <SiYoutube className="text-red-400" />,
    placeholder: "e.g. channel-name or full URL",
  },
];

export function AccountSettings({
  onClose,
  onSave: _onSave,
}: {
  onClose?: () => void;
  onSave?: () => void;
}) {
  const { user } = useAuth();
  const {
    data,
    isLoading,
    mutate: mutateProfile,
  } = useSWR(user ? `/api/users/${user?.id}/profile` : null, (url) =>
    fetch(url).then((res) => res.json())
  );
  const [form, setForm] = useState({
    name: "",
    bio: "",
    alias: "",
    avatarUrl: "",
    bannerUrl: "",
    region: "",
    socials: {
      twitter: "",
      discord: "",
      github: "",
      linkedin: "",
      youtube: "",
    },
  });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  React.useEffect(() => {
    if (data) {
      let socials = {
        twitter: "",
        discord: "",
        github: "",
        linkedin: "",
        youtube: "",
      };
      try {
        if (data.socials && typeof data.socials === "string") {
          const parsed = JSON.parse(data.socials);
          socials = { ...socials, ...parsed };
        } else if (typeof data.socials === "object") {
          socials = { ...socials, ...data.socials };
        }
      } catch {}
      setForm({
        name: data.name !== "Not set" ? data.name : "",
        bio: data.bio !== "Not set" ? data.bio : "",
        alias: data.alias !== "Not set" ? data.alias : "",
        avatarUrl: data.avatarUrl !== "Not set" ? data.avatarUrl : "",
        bannerUrl: data.bannerUrl !== "Not set" ? data.bannerUrl : "",
        region: data.region !== "Not set" ? data.region : "",
        socials,
      });
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name in form.socials) {
      setForm({ ...form, socials: { ...form.socials, [name]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setFeedback("");
    const payload = { ...form, socials: JSON.stringify(form.socials) };
    try {
      await fetch(`/api/users/${user?.id}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      mutateProfile();
      setFeedback("Profile updated!");
      setTimeout(() => {
        setEditMode(false);
        setFeedback("");
      }, 1000);
    } catch {
      setFeedback("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div
        className="bg-white dark:bg-linear-to-br dark:from-[#1a1a2e] dark:to-[#23234d] rounded-2xl p-6 shadow-2xl animate-pulse h-44 min-h-[220px] border-2 border-purple-500/40 animate-glow"
        id="account-settings-section"
      />
    );
  }

  return (
    <form
      className="bg-white dark:bg-linear-to-br dark:from-[#181a2a] dark:to-[#23234d] rounded-2xl p-6 shadow-2xl w-full max-w-lg mx-auto flex flex-col gap-6 relative text-base max-h-[90vh] overflow-y-auto border-2 border-purple-500/40 animate-glow text-gray-900 dark:text-white"
      onSubmit={handleSave}
      style={{ fontSize: "1rem" }}
    >
      {/* Close Icon */}
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-900 dark:text-white text-2xl hover:text-pink-400 z-50 transition-all duration-200"
        >
          <FiX />
        </button>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-2 pt-2 pb-2">
        <span className="text-3xl text-purple-400 drop-shadow-glow">
          <FiUser />
        </span>
        <h3 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent animate-gradient-move futuristic-title drop-shadow-glow">
          Account Settings
        </h3>
        {!editMode && (
          <button
            className="ml-auto futuristic-button px-5 py-2 text-base font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-all duration-200"
            onClick={() => setEditMode(true)}
          >
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>
      <div className="h-1 w-full bg-linear-to-r from-purple-500/40 via-blue-500/40 to-pink-500/40 rounded-full mb-2 animate-glow" />
      {/* Content */}
      <div className="px-2 pb-2">
        {editMode ? (
          <div className="flex flex-col gap-6 z-10 relative animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="block text-purple-700 dark:text-purple-300 font-semibold mb-1 items-center gap-2 drop-shadow-glow">
                  <FiUser /> Alias Name
                </label>
                <input
                  name="alias"
                  value={form.alias}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-white/10 rounded px-3 py-2 w-full border-2 border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-pink-400 transition-all duration-200 shadow-inner"
                  placeholder="Enter alias..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-purple-700 dark:text-purple-300 font-semibold mb-1 flex items-center gap-2 drop-shadow-glow">
                  <FiGlobe /> Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-white/10 rounded px-3 py-2 w-full border-2 border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-pink-400 transition-all duration-200 shadow-inner"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-purple-700 dark:text-purple-300 font-semibold mb-1 flex items-center gap-2 drop-shadow-glow">
                  <FiImage /> Avatar URL
                </label>
                <input
                  name="avatarUrl"
                  value={form.avatarUrl}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-white/10 rounded px-3 py-2 w-full border-2 border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-pink-400 transition-all duration-200 shadow-inner"
                  placeholder="Avatar URL..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-purple-700 dark:text-purple-300 font-semibold mb-1 flex items-center gap-2 drop-shadow-glow">
                  <FiImage /> Banner URL
                </label>
                <input
                  name="bannerUrl"
                  value={form.bannerUrl}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-white/10 rounded px-3 py-2 w-full border-2 border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-pink-400 transition-all duration-200 shadow-inner"
                  placeholder="Banner image URL..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-purple-700 dark:text-purple-300 font-semibold mb-1 flex items-center gap-2 drop-shadow-glow">
                  <FiGlobe /> Region
                </label>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className="bg-gray-100 dark:bg-white/10 rounded px-3 py-2 w-full border-2 border-purple-500/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-pink-400 transition-all duration-200 shadow-inner"
                  placeholder="Region..."
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-purple-700 dark:text-purple-300 font-semibold mb-1 flex items-center gap-2 drop-shadow-glow">
                  Socials
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SOCIALS.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded px-2 py-1 border-2 border-purple-500/20 shadow-inner"
                    >
                      {s.icon}
                      <input
                        name={s.name}
                        value={
                          form.socials[s.name as keyof typeof form.socials] ||
                          ""
                        }
                        onChange={handleChange}
                        className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none w-full placeholder-purple-400 dark:placeholder-purple-300"
                        placeholder={s.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transition text-base border-2 border-purple-500/40"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-linear-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition text-base border-2 border-pink-500/40"
                disabled={saving}
              >
                {saving ? (
                  <FiLoader className="animate-spin inline-block mr-2" />
                ) : null}
                Save
              </button>
            </div>
            {feedback && (
              <div
                className={`mt-2 text-center text-base ${
                  feedback.includes("error") ? "text-red-400" : "text-green-400"
                } drop-shadow-glow`}
              >
                {feedback}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-900 dark:text-white text-base md:text-lg">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 drop-shadow-glow">
                <FiUser /> Alias:
              </span>
              <span className="text-gray-800 dark:text-white/90 drop-shadow-glow">
                {data.alias}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 drop-shadow-glow">
                <FiGlobe /> Bio:
              </span>
              <span className="text-gray-800 dark:text-white/90 drop-shadow-glow">
                {data.bio}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 drop-shadow-glow">
                <FiImage /> Avatar:
              </span>
              <span className="break-all text-gray-800 dark:text-white/90 drop-shadow-glow">
                {data.avatarUrl}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 drop-shadow-glow">
                <FiImage /> Banner:
              </span>
              <span className="break-all text-gray-800 dark:text-white/90 drop-shadow-glow">
                {data.bannerUrl}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 drop-shadow-glow">
                <FiGlobe /> Region:
              </span>
              <span className="text-gray-800 dark:text-white/90 drop-shadow-glow">
                {data.region}
              </span>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 drop-shadow-glow">
                Socials:
              </span>
              <div className="flex items-center gap-3 mt-1">
                {SOCIALS.map((s) => {
                  const val =
                    (form.socials &&
                      form.socials[s.name as keyof typeof form.socials]) ||
                    "";
                  if (!val) return null;
                  let url = val;
                  if (s.name === "twitter" && !val.startsWith("http"))
                    url = `https://twitter.com/${val.replace("@", "")}`;
                  if (s.name === "github" && !val.startsWith("http"))
                    url = `https://github.com/${val}`;
                  if (s.name === "linkedin" && !val.startsWith("http"))
                    url = `https://linkedin.com/in/${val}`;
                  if (s.name === "discord")
                    url = `https://discord.com/users/${val}`;
                  if (s.name === "youtube") url = `https://youtube.com/${val}`;
                  return (
                    <a
                      key={s.name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform drop-shadow-glow"
                      title={s.name}
                    >
                      {s.icon}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
