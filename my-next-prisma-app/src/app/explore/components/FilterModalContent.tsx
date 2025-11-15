"use client";

import { Dispatch, SetStateAction, useState } from "react";

const TAG_OPTIONS = [
  "#Trending",
  "#Premium",
  "#Free",
  "#EditorsChoice",
  "#MostLiked",
  "#MostAttempted",
  "#Popular",
  "#Recommended",
];
const DIFFICULTY_OPTIONS = [
  "Super Easy",
  "Easy",
  "Normal",
  "Medium",
  "Hard",
  "Impossible",
  "Insane",
];
const QUIZ_TYPE_OPTIONS = [
  "MCQ",
  "Essay",
  "Timed",
  "PictureQuiz",
  "AudioQuiz",
  "VideoQuiz",
  "Poll",
];

export type FilterState = {
  tags: string[];
  sortBy: string;
  sortOrder: string;
  field: string;
  subject: string;
  minPrice: number;
  maxPrice: number;
  difficulty: string[];
  quizType: string[];
  isFree?: boolean | null;
  dateRange?: { from: string; to: string } | null;
};

type FilterModalContentProps = {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  onClose: () => void;
};

export default function FilterModalContent({
  filters,
  setFilters,
  onClose,
}: FilterModalContentProps) {
  const [tagSearch, setTagSearch] = useState("");

  // Add styles for select options to be theme-aware
  const selectOptionStyles = `
    option {
      background-color: white;
      color: #111827;
    }
    @media (prefers-color-scheme: dark) {
      option {
        background-color: #1f2937;
        color: white;
      }
    }
  `;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split("_");
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy || "",
      sortOrder: sortOrder || "",
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleDifficultyToggle = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty.includes(level)
        ? prev.difficulty.filter((d) => d !== level)
        : [...prev.difficulty, level],
    }));
  };

  const handleQuizTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      quizType: prev.quizType.includes(type)
        ? prev.quizType.filter((q) => q !== type)
        : [...prev.quizType, type],
    }));
  };

  const handleFreeToggle = (val: boolean | null) => {
    setFilters((prev) => ({ ...prev, isFree: val }));
  };

  const handleDateChange = (key: "from" | "to", value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        from: key === "from" ? value : prev.dateRange?.from || "",
        to: key === "to" ? value : prev.dateRange?.to || "",
      },
    }));
  };

  const handleReset = () => {
    setFilters({
      tags: [],
      sortBy: "createdAt",
      sortOrder: "desc",
      field: "",
      subject: "",
      minPrice: 0,
      maxPrice: 100,
      difficulty: [],
      quizType: [],
      isFree: null,
      dateRange: { from: "", to: "" },
    });
  };

  // Filter tag options by search
  const filteredTags = TAG_OPTIONS.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="bg-white text-gray-900 dark:bg-slate-900/80 dark:text-white backdrop-blur-xl border border-gray-300 dark:border-slate-700 rounded-2xl p-4 w-full md:w-[70vw] max-w-4xl shadow-2xl shadow-black/40 max-h-screen overflow-y-auto">
      <style dangerouslySetInnerHTML={{ __html: selectOptionStyles }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Main Filters */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Sort By */}
          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              Sort By
            </label>
            <select
              id="sort"
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={handleSortChange}
              className="w-full bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="likeCount_desc">Most Liked</option>
              <option value="usersTaken_desc">Most Attempted</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          {/* Field */}
          <div>
            <label
              htmlFor="field"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              Field
            </label>
            <select
              id="field"
              value={filters.field}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  field: e.target.value,
                  subject: "",
                }))
              }
              className="w-full bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            >
              <option value="">All Fields</option>
              <option value="Science">Science</option>
              <option value="Technology">Technology</option>
              <option value="Arts">Arts</option>
              <option value="History">History</option>
            </select>
          </div>
          {/* Subject (Conditional) */}
          {filters.field && (
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              >
                Subject
              </label>
              <select
                id="subject"
                value={filters.subject}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
              >
                <option value="">All Subjects</option>
                {filters.field === "Science" && (
                  <>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </>
                )}
                {filters.field === "Technology" && (
                  <>
                    <option value="Programming">Programming</option>
                    <option value="AI">AI</option>
                    <option value="Networking">Networking</option>
                  </>
                )}
              </select>
            </div>
          )}
          {/* Price Range */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              Price Range
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: Number(e.target.value),
                  }))
                }
                className="w-full bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-gray-900 dark:text-white">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: Number(e.target.value),
                  }))
                }
                className="w-full bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          {/* Free/Paid Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Free/Paid
            </label>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-all border ${
                  filters.isFree === null
                    ? "bg-white text-gray-900 dark:bg-white/10 dark:text-white border-gray-300 dark:border-white/20"
                    : "bg-white/50 text-gray-500 dark:bg-white/5 dark:text-white/40 border-gray-200 dark:border-white/10"
                }`}
                onClick={() => handleFreeToggle(null)}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-all border ${
                  filters.isFree === true
                    ? "bg-fuchsia-600/80 text-white border-fuchsia-400"
                    : "bg-white text-gray-900 dark:bg-white/10 dark:text-white border-gray-300 dark:border-white/20"
                }`}
                onClick={() => handleFreeToggle(true)}
              >
                Free Only
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-all border ${
                  filters.isFree === false
                    ? "bg-blue-600/80 text-white border-blue-400"
                    : "bg-white text-gray-900 dark:bg-white/10 dark:text-white border-gray-300 dark:border-white/20"
                }`}
                onClick={() => handleFreeToggle(false)}
              >
                Paid Only
              </button>
            </div>
          </div>
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Upload Date
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={filters.dateRange?.from || ""}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
              />
              <span className="text-gray-900 dark:text-white">-</span>
              <input
                type="date"
                value={filters.dateRange?.to || ""}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
              />
            </div>
          </div>
        </div>
        {/* Right Column: Tag, Difficulty, Quiz Type, Reset/Apply */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Tag Multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Tags
            </label>
            <input
              type="text"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full mb-2 bg-white text-gray-900 dark:bg-white/10 dark:text-white border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                    filters.tags.includes(tag)
                      ? "bg-fuchsia-600/80 text-white border-fuchsia-400"
                      : "bg-white text-gray-900 dark:bg-white/10 dark:text-white border-gray-300 dark:border-white/20"
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          {/* Difficulty Multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                    filters.difficulty.includes(level)
                      ? "bg-blue-600/80 text-white border-blue-400"
                      : "bg-white text-gray-900 dark:bg-white/10 dark:text-white border-gray-300 dark:border-white/20"
                  }`}
                  onClick={() => handleDifficultyToggle(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          {/* Quiz Type Multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Quiz Type
            </label>
            <div className="flex flex-wrap gap-2">
              {QUIZ_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                    filters.quizType.includes(type)
                      ? "bg-purple-600/80 text-white border-purple-400"
                      : "bg-white text-gray-900 dark:bg-white/10 dark:text-white border-gray-300 dark:border-white/20"
                  }`}
                  onClick={() => handleQuizTypeToggle(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/* Reset & Apply Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-auto">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg font-semibold transition-all"
              type="button"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white rounded-lg font-semibold transition-all"
              type="button"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
