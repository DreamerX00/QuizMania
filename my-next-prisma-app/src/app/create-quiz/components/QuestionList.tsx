"use client";
import React from "react";
import { motion, Reorder } from "framer-motion";
import { FiEdit2, FiTrash2, FiCopy, FiMenu } from "react-icons/fi";
import { Question, QUESTION_TYPES } from "../types";

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question, index: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  onReorder: (newOrder: Question[]) => void;
  viewMode: "grid" | "list";
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
  viewMode,
}) => {
  const getQuestionTypeInfo = (typeId: string) => {
    return (
      QUESTION_TYPES.find((t: { id: string }) => t.id === typeId) ||
      QUESTION_TYPES[0]
    );
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No questions added yet</p>
        <p className="text-sm mt-2">Click "Add Question" to get started</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {questions.map((question, index) => {
          const typeInfo = getQuestionTypeInfo(question.type);
          if (!typeInfo) return null;

          return (
            <motion.div
              key={question.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeInfo.icon}</span>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Q{index + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {typeInfo.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(question, index)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDuplicate(index)}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                  >
                    <FiCopy size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {question.text}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{question.points} pts</span>
                {question.timeLimit && <span>{question.timeLimit}s</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={questions}
      onReorder={onReorder}
      className="space-y-2"
    >
      {questions.map((question, index) => {
        const typeInfo = getQuestionTypeInfo(question.type);
        if (!typeInfo) return null;

        return (
          <Reorder.Item key={question.id} value={question}>
            <motion.div
              layout
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiMenu size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{typeInfo.icon}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Q{index + 1}. {typeInfo.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({question.points} pts)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {question.text}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(question, index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDuplicate(index)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                  >
                    <FiCopy size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};
