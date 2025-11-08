"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSearch } from "react-icons/fi";
import { QUESTION_TYPES } from "../types";

interface QuestionTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (typeId: string) => void;
}

export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState("");

  const filteredTypes = QUESTION_TYPES.filter(
    (type) =>
      type.name.toLowerCase().includes(search.toLowerCase()) ||
      type.guide.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Question Type
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search question types..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Question Types Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => {
                      onSelect(type.id);
                      onClose();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 border-transparent bg-linear-to-br ${type.color} text-white hover:shadow-lg transition-all text-left`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{type.icon}</span>
                      <span className="font-bold text-lg">{type.name}</span>
                    </div>
                    <p className="text-sm opacity-90 line-clamp-2">
                      {type.guide}
                    </p>
                  </motion.button>
                ))}
              </div>

              {filteredTypes.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No question types found matching &quot;{search}&quot;</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

