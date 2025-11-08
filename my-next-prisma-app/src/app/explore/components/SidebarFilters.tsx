import { FiSearch, FiTrendingUp, FiFilter, FiBookOpen, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";

export default function SidebarFilters() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="futuristic-card p-8 rounded-3xl border border-purple-500/40 shadow-2xl bg-black/40 backdrop-blur-2xl flex flex-col gap-8"
    >
      {/* Sort By */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiTrendingUp className="text-pink-400 text-xl" />
          <span className="text-base font-bold futuristic-title tracking-wide bg-linear-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-move">Sort By</span>
        </div>
        <select className="futuristic-input w-full rounded-xl px-4 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none" disabled>
          <option>Most Attempted</option>
          <option>Highest Rated</option>
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Most Liked</option>
        </select>
      </div>
      {/* Field -> Subject */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiBookOpen className="text-yellow-400 text-xl" />
          <span className="text-base font-bold futuristic-title tracking-wide bg-linear-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent animate-gradient-move">Explore by Field</span>
        </div>
        <select className="futuristic-input w-full rounded-xl px-4 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white mb-2 focus:outline-none" disabled>
          <option>Science</option>
          <option>History</option>
          <option>Commerce</option>
          <option>Arts</option>
          <option>Philosophy</option>
          <option>Programming</option>
          <option>School (Class 1-12)</option>
          <option>Competitive Exams</option>
        </select>
        <select className="futuristic-input w-full rounded-xl px-4 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none" disabled>
          <option>Subject (dynamic)</option>
        </select>
      </div>
      {/* Pricing */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiDollarSign className="text-green-400 text-xl" />
          <span className="text-base font-bold futuristic-title tracking-wide bg-linear-to-r from-green-400 to-blue-400 bg-clip-text text-transparent animate-gradient-move">Pricing Filter</span>
        </div>
        <select className="futuristic-input w-full rounded-xl px-4 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none" disabled>
          <option>All</option>
          <option>Free Only</option>
          <option>Paid Only</option>
          <option>Price: High to Low</option>
          <option>Price: Low to High</option>
        </select>
      </div>
    </motion.div>
  );
} 
