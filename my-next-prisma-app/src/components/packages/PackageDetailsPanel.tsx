import React, { useState, useEffect } from "react";
import { BookOpen, Edit, Trash2, X, Upload, Download } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { SWRResponse } from "swr";

interface QuizPreview {
  id: string;
  title: string;
  imageUrl?: string;
}

interface QuizPackage {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  quizIds: string[];
  createdAt: string;
  isPublished?: boolean;
  price: number;
  // Real-time stats fields
  totalAttempts?: number;
  totalLikes?: number;
  earnings?: number;
  averageRating?: number;
  averageScore?: number;
}

interface PackageDetailsPanelProps {
  pkg: QuizPackage;
  quizzes: QuizPreview[];
  isEditing?: boolean;
  onClose: () => void;
  onUpdate: (updated: QuizPackage) => void;
  onDelete: () => void;
  onPublish: () => void;
  stats?: {
    earnings: number;
    attempts: number;
    likes: number;
    averageRating?: number;
    averageScore?: number;
    quizCount?: number;
  };
  statsError?: SWRResponse["error"];
  availableQuizzes?: QuizPreview[];
  publishLoading?: boolean;
}

const PackageDetailsPanel: React.FC<PackageDetailsPanelProps> = ({
  pkg,
  quizzes,
  isEditing: initialEditing = false,
  onClose,
  onUpdate,
  onDelete,
  onPublish,
  stats,
  statsError,
  availableQuizzes = [],
  publishLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [form, setForm] = useState({
    title: pkg.title,
    description: pkg.description || "",
    imageUrl: pkg.imageUrl || "",
    quizIds: pkg.quizIds || [],
    price: pkg.price || 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [pricingMode, setPricingMode] = useState<"free" | "paid">(
    pkg.price === 0 ? "free" : "paid"
  );

  useEffect(() => {
    setForm({
      title: pkg.title,
      description: pkg.description || "",
      imageUrl: pkg.imageUrl || "",
      quizIds: pkg.quizIds || [],
      price: pkg.price || 0,
    });
    setPricingMode(pkg.price === 0 ? "free" : "paid");
  }, [pkg]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdate({ ...pkg, ...form, quizIds: form.quizIds });
    setIsEditing(false);
  };

  // Add quiz to package
  const handleAddQuiz = (quizId: string) => {
    if (!form.quizIds.includes(quizId)) {
      const newQuizIds = [...form.quizIds, quizId];
      setForm((f) => ({ ...f, quizIds: newQuizIds }));
      onUpdate({ ...pkg, ...form, quizIds: newQuizIds });
    }
  };

  // Remove quiz from package
  const handleRemoveQuiz = (quizId: string) => {
    const newQuizIds = form.quizIds.filter((id) => id !== quizId);
    setForm((f) => ({ ...f, quizIds: newQuizIds }));
    onUpdate({ ...pkg, ...form, quizIds: newQuizIds });
  };

  // Quizzes available to add (not already in package)
  const addableQuizzes = availableQuizzes.filter(
    (q) => !form.quizIds.includes(q.id)
  );

  return (
    <div className="w-full h-full flex flex-col bg-white/80 dark:bg-black/20 border border-white/10 rounded-2xl p-6 md:p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="text-2xl font-bold bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-gray-900 dark:text-white w-full max-w-[260px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[260px]">
            {pkg.title}
          </h2>
        )}
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors ml-2"
        >
          <X size={20} />
        </button>
      </div>
      {/* Stats Overview */}
      {statsError && statsError.status === 404 ? (
        <div className="flex items-center justify-between gap-2 mb-6 p-3 rounded-xl bg-linear-to-r from-purple-900/40 to-blue-900/30 border border-white/10 shadow text-white/60 text-center w-full">
          No stats available
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-gray-500 dark:text-white/60 mb-1">
                Total Attempts
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.attempts}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-white/60 mb-1">
                Likes
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.likes}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-white/60 mb-1">
                Earnings
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                ₹{stats.earnings}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-white/60 mb-1">
                Price
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {pkg.price === 0 ? "Free" : `₹${Math.floor(pkg.price / 100)}`}
              </div>
            </div>
            {stats.averageRating !== undefined && (
              <div>
                <div className="text-xs text-gray-500 dark:text-white/60 mb-1">
                  Rating
                </div>
                <div className="text-xl font-bold text-yellow-500 dark:text-yellow-400">
                  ⭐ {stats.averageRating}
                </div>
              </div>
            )}
            {stats.averageScore !== undefined && (
              <div>
                <div className="text-xs text-gray-500 dark:text-white/60 mb-1">
                  Avg Score
                </div>
                <div className="text-xl font-bold text-purple-500 dark:text-purple-400">
                  {stats.averageScore}%
                </div>
              </div>
            )}
          </div>
        )
      )}
      {/* Package Info Cards */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-800 dark:text-white">
          <span className="font-semibold">Quizzes:</span> {quizzes.length}
        </div>
        <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-800 dark:text-white">
          <span className="font-semibold">Status:</span>{" "}
          {pkg.isPublished ? "Published" : "Draft"}
        </div>
        <div className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-1 rounded-full text-gray-800 dark:text-white">
          <span className="font-semibold">Type:</span>{" "}
          {pkg.price === 0 ? "Free" : "Paid"}
        </div>
      </div>
      <div className="space-y-4 text-sm">
        {/* Image */}
        <div className="w-full aspect-[16/9] mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
          {pkg.imageUrl ? (
            <img
              src={form.imageUrl || pkg.imageUrl}
              alt={pkg.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-300 dark:text-white/40">
              IMG
            </div>
          )}
        </div>
        {/* Image URL input (edit mode only) */}
        {isEditing && (
          <div className="mb-2">
            <label className="text-xs text-white/60 mb-1 block">
              Image URL
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="Image URL"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
        {/* Description */}
        <div>
          <label className="text-xs text-gray-600 dark:text-white/60">
            Description
          </label>
          {isEditing ? (
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px]"
            />
          ) : (
            <p className="text-gray-900 dark:text-white min-h-[40px]">
              {pkg.description || "No description provided."}
            </p>
          )}
        </div>
        {/* Package Pricing */}
        <div>
          <label className="text-xs text-gray-600 dark:text-white/60">
            Package Pricing
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPricingMode("free");
                    setForm((f) => ({ ...f, price: 0 }));
                  }}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                    pricingMode === "free"
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-gray-600 dark:text-white/60 hover:bg-white/20"
                  }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPricingMode("paid");
                    setForm((f) => ({
                      ...f,
                      price: f.price === 0 ? 100 : f.price,
                    }));
                  }}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                    pricingMode === "paid"
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-gray-600 dark:text-white/60 hover:bg-white/20"
                  }`}
                >
                  Paid
                </button>
              </div>
              {pricingMode === "paid" && (
                <div className="relative">
                  <input
                    type="number"
                    value={form.price / 100}
                    onChange={(e) => {
                      const value = Math.max(0, parseInt(e.target.value) || 0);
                      setForm((f) => ({ ...f, price: value * 100 }));
                      // Keep pricing mode as 'paid' even when value is 0
                      if (pricingMode !== "paid") {
                        setPricingMode("paid");
                      }
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-white/60">
                    ₹
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-900 dark:text-white">
              {pkg.price === 0
                ? "Free Package"
                : `₹${Math.floor(pkg.price / 100)}`}
            </p>
          )}
        </div>
        {/* Created Date */}
        <div className="text-xs text-gray-500 dark:text-white/60">
          Created: {new Date(pkg.createdAt).toLocaleDateString()}
        </div>
        {/* Quizzes List */}
        <div>
          <label className="text-xs text-gray-600 dark:text-white/60 mb-2 block">
            Quizzes in this package:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {quizzes.length === 0 && (
              <div className="text-gray-400 dark:text-white/40">
                No quizzes in this package.
              </div>
            )}
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1"
              >
                <div className="w-10 h-8 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
                  {q.imageUrl ? (
                    <img
                      src={q.imageUrl}
                      alt={q.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <BookOpen
                      size={20}
                      className="text-gray-400 dark:text-white/30"
                    />
                  )}
                </div>
                <span className="flex-1 truncate text-gray-900 dark:text-white text-sm">
                  {q.title}
                </span>
                {/* Remove button for draft packages */}
                {!pkg.isPublished && (
                  <button
                    className="p-1 rounded hover:bg-red-500/20 transition-colors"
                    title="Remove Quiz"
                    onClick={() => handleRemoveQuiz(q.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Add quiz multi-select modal for draft packages */}
          {!pkg.isPublished && addableQuizzes.length > 0 && (
            <div className="mt-4">
              <button
                className="w-full px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-600"
                onClick={() => setShowAddModal(true)}
              >
                Add Quiz to Package
              </button>
              {/* Modal for multi-select */}
              {showAddModal && (
                <Modal
                  open={showAddModal}
                  onClose={() => setShowAddModal(false)}
                >
                  <div className="bg-[#181a20] rounded-2xl p-6 w-full max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Add Quizzes to Package
                    </h3>
                    <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                      {addableQuizzes.map((q) => (
                        <label
                          key={q.id}
                          className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedToAdd.includes(q.id)}
                            onChange={(e) => {
                              setSelectedToAdd((sel) =>
                                e.target.checked
                                  ? [...sel, q.id]
                                  : sel.filter((id) => id !== q.id)
                              );
                            }}
                            className="accent-blue-500 w-4 h-4"
                          />
                          <div className="w-10 h-8 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
                            {q.imageUrl ? (
                              <img
                                src={q.imageUrl}
                                alt={q.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <BookOpen
                                size={20}
                                className="text-gray-400 dark:text-white/30"
                              />
                            )}
                          </div>
                          <span className="flex-1 truncate text-gray-900 dark:text-white text-sm">
                            {q.title}
                          </span>
                        </label>
                      ))}
                      {addableQuizzes.length === 0 && (
                        <div className="text-gray-400 dark:text-white/40">
                          No quizzes available to add.
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                      <button
                        className="px-4 py-2 rounded-lg bg-white/10 text-gray-900 dark:text-white hover:bg-white/20"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                        disabled={selectedToAdd.length === 0}
                        onClick={() => {
                          selectedToAdd.forEach((id) => handleAddQuiz(id));
                          setSelectedToAdd([]);
                          setShowAddModal(false);
                        }}
                      >
                        Add Selected
                      </button>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-3 mt-8 justify-end flex-wrap">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg bg-white/10 text-gray-900 dark:text-white hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-600"
            >
              Save
            </button>
          </>
        ) : (
          <>
            {/* If published, only show Unpublish button and stats */}
            {pkg.isPublished ? (
              <button
                onClick={onPublish}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30`}
                disabled={publishLoading}
              >
                <Download size={16} /> Unpublish
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-gray-900 dark:text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button
                  onClick={onPublish}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600`}
                  disabled={publishLoading}
                >
                  <Upload size={16} /> Publish
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PackageDetailsPanel;
