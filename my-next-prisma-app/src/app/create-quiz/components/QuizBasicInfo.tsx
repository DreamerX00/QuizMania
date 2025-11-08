"use client";
import React from "react";
import { FiImage, FiTag, FiDollarSign } from "react-icons/fi";
import { academicFields, DIFFICULTY_LEVELS } from "../types";

interface QuizBasicInfoProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

export const QuizBasicInfo: React.FC<QuizBasicInfoProps> = ({
  formData,
  onUpdate,
}) => {
  const subcategories = formData.category
    ? academicFields[formData.category as keyof typeof academicFields] || []
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Quiz Information
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Quiz Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Enter quiz title"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Describe your quiz"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category & Subcategory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              onUpdate("category", e.target.value);
              onUpdate("subcategory", "");
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {Object.keys(academicFields).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subcategory *
          </label>
          <select
            value={formData.subcategory}
            onChange={(e) => onUpdate("subcategory", e.target.value)}
            disabled={!formData.category}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub: string) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Difficulty Level *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onUpdate("difficultyLevel", level.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.difficultyLevel === level.value
                  ? `${level.color} border-transparent text-white`
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="text-sm font-semibold">{level.label}</div>
              <div className="text-xs opacity-80 mt-1">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <FiImage className="inline mr-1" />
          Cover Image URL
        </label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => onUpdate("imageUrl", e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <FiTag className="inline mr-1" />
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags.join(", ")}
          onChange={(e) =>
            onUpdate(
              "tags",
              e.target.value.split(",").map((t) => t.trim())
            )
          }
          placeholder="javascript, react, web development"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Premium Options */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={formData.isPremium}
            onChange={(e) => onUpdate("isPremium", e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Make this a premium quiz
          </span>
        </label>

        {formData.isPremium && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FiDollarSign className="inline mr-1" />
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                onUpdate("price", parseFloat(e.target.value) || 0)
              }
              min="0"
              step="10"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Quiz Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Quiz Settings
        </h3>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.randomizeQuestions}
            onChange={(e) => onUpdate("randomizeQuestions", e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Randomize question order
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.randomizeOptions}
            onChange={(e) => onUpdate("randomizeOptions", e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Randomize option order
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.showResults}
            onChange={(e) => onUpdate("showResults", e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Show results after completion
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.allowReview}
            onChange={(e) => onUpdate("allowReview", e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Allow answer review
          </span>
        </label>
      </div>
    </div>
  );
};

