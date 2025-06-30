"use client";
import React, { useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import type { Quiz } from '@prisma/client';
import TemplateCard from "./TemplateCard";
import TemplateActionPanel from "./TemplateActionPanel";
import { Loader2 } from "lucide-react";
import { FiGrid, FiList } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';

const PRICE_MIN = 0;
const PRICE_MAX = 999;

const fetcher = (url: string) => fetch(url).then(res => res.json());

const SkeletonCard = () => (
  <div className="rounded-2xl bg-gradient-to-br from-gray-200/40 dark:from-purple-900/40 to-gray-300/30 dark:to-blue-900/30 border border-gray-300/50 dark:border-white/10 shadow-xl p-5 flex flex-col gap-3 animate-pulse">
    <div className="aspect-video w-full bg-gray-300 dark:bg-white/10 rounded-xl mb-2" />
    <div className="h-6 w-2/3 bg-gray-400 dark:bg-white/20 rounded mb-1" />
    <div className="h-4 w-full bg-gray-300 dark:bg-white/10 rounded mb-1" />
    <div className="mt-auto pt-3 border-t border-gray-300/50 dark:border-white/10 flex justify-between items-center">
      <div className="h-4 w-1/3 bg-gray-300 dark:bg-white/10 rounded" />
      <div className="h-4 w-1/4 bg-gray-300 dark:bg-white/10 rounded" />
    </div>
  </div>
);

export default function MyTemplateDialog({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sort, setSort] = useState("createdAt_desc");
  const calendarBtnRef = useRef<HTMLButtonElement>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [debouncedSearch] = useDebounce(search, 500);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const resetFilters = () => {
    setSearch("");
    setPrice([PRICE_MIN, PRICE_MAX]);
    setDateRange(undefined);
    setSort("createdAt_desc");
  };
  
  const params = new URLSearchParams();
  if (debouncedSearch) params.append('search', debouncedSearch);
  params.append('minPrice', String(price[0]));
  if (price[1] < PRICE_MAX) params.append('maxPrice', String(price[1]));
  if (dateRange?.from) params.append('fromDate', dateRange.from.toISOString());
  if (dateRange?.to) params.append('toDate', dateRange.to.toISOString());
  if (sort) {
    const [sortBy, sortOrder] = sort.split('_');
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
  }

  const { data: quizzes, error, isLoading, mutate } = useSWR<Quiz[]>(`/api/quizzes/templates?${params.toString()}`, fetcher);

  return (
    <Modal open={true} onClose={onClose} fullScreen>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50/90 dark:from-[#181a20]/90 to-gray-100/90 dark:to-[#23243a]/90 p-2 sm:p-6"
      >
        <div className="w-full bg-white/80 dark:bg-black/50 border-b border-gray-200 dark:border-white/10 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-4 md:gap-0 md:flex-row md:items-start md:justify-between">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-[240px]">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">Search</label>
                <input
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full h-[40px]"
                  placeholder="Quiz name or tag..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-[240px]">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">Price Range</label>
                <div className="flex flex-col gap-0.5 bg-white dark:bg-white/10 rounded-xl px-4 py-2 border border-gray-300 dark:border-white/20 shadow-sm backdrop-blur-md w-full">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-white/60 mb-0.5">
                    <span>Min: ₹{price[0]}</span>
                    <span>Max: ₹{price[1] === PRICE_MAX ? '999+' : price[1]}</span>
                  </div>
                  <Slider
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={10}
                    value={price}
                    onValueChange={v => setPrice([v[0], v[1] ?? v[0]])}
                    defaultValue={[PRICE_MIN, PRICE_MAX]}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-[240px] relative">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">Date Range</label>
                <button
                  ref={calendarBtnRef}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm w-full text-left backdrop-blur-md relative h-[40px]"
                  onClick={() => setShowCalendar(v => !v)}
                  type="button"
                >
                  {dateRange && dateRange.from && dateRange.to
                    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    : "Select date range"}
                  <span className="ml-auto text-gray-400 dark:text-white/40">▼</span>
                </button>
                {showCalendar && (
                  <div className="absolute left-0 top-[110%] z-50 bg-white dark:bg-black/95 border border-gray-200 dark:border-white/20 rounded-xl shadow-2xl p-2 min-w-[260px] animate-fade-in-up" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-white dark:bg-black/95 border-l border-t border-gray-200 dark:border-white/20 rotate-45" style={{zIndex:2}} />
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        if (range && range.from && range.to) setShowCalendar(false);
                      }}
                      numberOfMonths={1}
                      initialFocus
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 min-w-[220px] w-full md:w-[240px]">
                <label className="text-xs text-gray-700 dark:text-white/80 font-semibold pl-1">Sort By</label>
                <select
                  className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm backdrop-blur-md w-full h-[40px]"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  <option value="createdAt_desc">Most Recent</option>
                  <option value="createdAt_asc">Oldest</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="price_desc">Price (High-Low)</option>
                  <option value="price_asc">Price (Low-High)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-2 md:mt-0 md:ml-6 self-end md:self-center mt-2 md:translate-y-[7.2px]">
              <button
                className="px-8 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold shadow hover:from-pink-600 hover:to-blue-600 transition-all border-0 focus:ring-2 focus:ring-pink-400 w-full md:w-[120px] h-[40px]"
                onClick={resetFilters}
                type="button"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="px-8 py-2 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all shadow focus:ring-2 focus:ring-blue-400 w-full md:w-[120px] h-[40px]"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-gray-50/50 dark:bg-black/20">
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }>
              {isLoading && [...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              {!isLoading && error && (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-red-500 dark:text-red-400">
                  <p>Failed to load templates.</p>
                </div>
              )}
              {!isLoading && !error && quizzes?.length === 0 && (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-600 dark:text-white/60">
                  <p className="text-lg">No templates found.</p>
                  <p>Try adjusting your filters or create a new quiz!</p>
                </div>
              )}
              {viewMode === 'grid' && quizzes?.map(quiz => (
                <div key={quiz.id} className={viewMode === 'list' ? 'w-full' : ''}>
                  <TemplateCard quiz={quiz} onSelect={(q) => setSelectedQuiz(q)} hideImage={viewMode === 'list'} />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-[400px] border-l border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-black/30">
            {selectedQuiz ? (
              <TemplateActionPanel
                quiz={selectedQuiz}
                onClose={() => setSelectedQuiz(null)}
                onDialogClose={onClose}
                mutate={mutate}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-white/40">Select a quiz to view details</div>
            )}
          </div>
        </div>
      </motion.div>
    </Modal>
  );
} 