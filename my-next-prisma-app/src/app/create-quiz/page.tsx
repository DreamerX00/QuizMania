"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import {
  FiUpload,
  FiFolder,
  FiPackage,
  FiPlus,
  FiSave,
  FiDownload,
  FiX,
  FiCheck,
  FiDollarSign,
  FiTag,
  FiImage,
  FiFileText,
  FiRotateCcw,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiList,
} from "react-icons/fi";
import MyTemplateDialog from "./MyTemplateDialog";
import FactoryDialog from "./FactoryDialog";
import { useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import Image from "next/image";

// Question Types with guides
const QUESTION_TYPES = [
  {
    id: "mcq-single",
    name: "MCQ (Single)",
    icon: "🔘",
    color: "from-blue-500 to-blue-600",
    guide:
      "Multiple choice question with one correct answer. Students select the best option from the given choices.",
  },
  {
    id: "mcq-multiple",
    name: "MCQ (Multiple)",
    icon: "☑️",
    color: "from-green-500 to-green-600",
    guide:
      "Multiple choice question with multiple correct answers. Students can select more than one option.",
  },
  {
    id: "true-false",
    name: "True/False",
    icon: "✅",
    color: "from-purple-500 to-purple-600",
    guide:
      "Simple true or false question. Students must determine if a statement is correct or incorrect.",
  },
  {
    id: "match",
    name: "Match Following",
    icon: "🔗",
    color: "from-orange-500 to-orange-600",
    guide:
      "Students match items from the left column with corresponding items in the right column.",
  },
  {
    id: "matrix",
    name: "Matrix",
    icon: "📊",
    color: "from-red-500 to-red-600",
    guide:
      "Grid-based question where students select answers in a matrix format with rows and columns.",
  },
  {
    id: "poll",
    name: "Poll",
    icon: "📈",
    color: "from-pink-500 to-pink-600",
    guide:
      "Survey-style question to gather opinions. No correct answer, just collects responses.",
  },
  {
    id: "paragraph",
    name: "Paragraph",
    icon: "📝",
    color: "from-indigo-500 to-indigo-600",
    guide:
      "Short answer question requiring a paragraph response. Manual grading required.",
  },
  {
    id: "fill-blanks",
    name: "Fill Blanks",
    icon: "⬜",
    color: "from-yellow-500 to-yellow-600",
    guide:
      "Text with blank spaces that students must fill in. Use ___ to mark blanks.",
  },
  {
    id: "code-output",
    name: "Code Output",
    icon: "💻",
    color: "from-gray-500 to-gray-600",
    guide:
      "Students predict the output of a code snippet. Useful for programming assessments.",
  },
  {
    id: "drag-drop",
    name: "Drag & Drop",
    icon: "🖱️",
    color: "from-teal-500 to-teal-600",
    guide:
      "Interactive question where students drag items to arrange them in correct order.",
  },
  {
    id: "image-based",
    name: "Image Based",
    icon: "🖼️",
    color: "from-cyan-500 to-cyan-600",
    guide:
      "Question based on an image. Students analyze the image to answer the question.",
  },
  {
    id: "audio",
    name: "Audio",
    icon: "🎵",
    color: "from-emerald-500 to-emerald-600",
    guide:
      "Question based on an audio clip. Students listen and answer questions about the audio.",
  },
  {
    id: "video",
    name: "Video",
    icon: "🎬",
    color: "from-rose-500 to-rose-600",
    guide:
      "Question based on a video clip. Students watch and answer questions about the video.",
  },
  {
    id: "essay",
    name: "Essay",
    icon: "✍️",
    color: "from-violet-500 to-violet-600",
    guide:
      "Long-form essay question requiring detailed written response. Manual grading required.",
  },
  {
    id: "ordering",
    name: "Ordering",
    icon: "📋",
    color: "from-lime-500 to-lime-600",
    guide: "Students arrange items in the correct sequence or order.",
  },
];

interface Option {
  id: string;
  text: string;
}

interface MatchPair {
  id: string;
  premise: string;
  response: string;
}

interface MatrixOptions {
  rows: Option[];
  cols: Option[];
}

interface DropZone {
  id: string;
  text: string; // The category name
}

interface Question {
  id: string;
  type: string;
  question: string;
  explanation?: string;
  timer?: number;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  marks?: number;

  // Type-specific fields
  options?: Option[]; // For MCQ
  correctAnswer?: unknown; // Flexible type for different question types

  matchPairs?: MatchPair[]; // For Matching

  orderedItems?: string[]; // For Ordering

  fillBlanksAnswers?: string[]; // For Fill in the Blanks

  matrixOptions?: MatrixOptions; // For Matrix

  codeSnippet?: string; // For Code Output

  // Fields for Drag & Drop
  draggableItems?: Option[];
  dropZones?: DropZone[];
  correctMapping?: { [itemId: string]: string }; // { draggableItemId: dropZoneId }
}

interface QuizData {
  quizTitle: string;
  tags: string[];
  questions: Question[];
  description?: string;
  totalMarks?: number;
  equalMarks?: boolean;
  marksPerQuestion?: number;
  imageUrl?: string;
  field?: string;
  subject?: string;
  durationInSeconds?: number;
  isLocked?: boolean;
  lockPassword?: string;
  difficultyLevel?: string;
  price?: number;
}

// --- Validation ---
const QUESTION_TYPE_IDS = QUESTION_TYPES.map((q) => q.id);

const validateQuestion = (
  question: Question
): { isValid: boolean; message: string } => {
  // Basic validation for all questions
  if (!question.id) {
    return { isValid: false, message: "Question ID is required." };
  }
  if (!question.type) {
    return { isValid: false, message: "Question type is required." };
  }
  if (!question.marks || question.marks <= 0) {
    return {
      isValid: false,
      message: "Question must have valid marks (greater than 0).",
    };
  }
  if (!question.question.trim() && question.type !== "code-output") {
    return { isValid: false, message: "Question text cannot be empty." };
  }

  // Type-specific validation
  switch (question.type) {
    case "mcq-single":
      if (!question.options || !Array.isArray(question.options)) {
        return {
          isValid: false,
          message: "MCQ questions must have an options array.",
        };
      }
      if (question.options.filter((o) => o.text.trim()).length < 2) {
        return {
          isValid: false,
          message: "MCQ questions must have at least 2 non-empty options.",
        };
      }
      if (!question.correctAnswer) {
        return {
          isValid: false,
          message: "You must select a correct answer for a single-choice MCQ.",
        };
      }
      if (!question.options.some((o) => o.id === question.correctAnswer)) {
        return {
          isValid: false,
          message: "The correct answer must match one of the option IDs.",
        };
      }
      break;

    case "mcq-multiple":
      if (!question.options || !Array.isArray(question.options)) {
        return {
          isValid: false,
          message: "MCQ questions must have an options array.",
        };
      }
      if (question.options.filter((o) => o.text.trim()).length < 2) {
        return {
          isValid: false,
          message: "MCQ questions must have at least 2 non-empty options.",
        };
      }
      if (
        !Array.isArray(question.correctAnswer) ||
        question.correctAnswer.length === 0
      ) {
        return {
          isValid: false,
          message:
            "You must select at least one correct answer for a multiple-choice MCQ.",
        };
      }
      if (
        !question.correctAnswer.every((ans) =>
          question.options?.some((o) => o.id === ans)
        )
      ) {
        return {
          isValid: false,
          message: "All correct answers must match option IDs.",
        };
      }
      break;

    case "true-false":
      if (typeof question.correctAnswer !== "boolean") {
        return {
          isValid: false,
          message: "True/False questions must have a boolean correct answer.",
        };
      }
      break;

    case "fill-blanks":
      if (
        !question.fillBlanksAnswers ||
        !Array.isArray(question.fillBlanksAnswers) ||
        question.fillBlanksAnswers.length === 0
      ) {
        return {
          isValid: false,
          message:
            "Fill in the blanks questions must have at least one answer.",
        };
      }
      if (!question.question.includes("___")) {
        return {
          isValid: false,
          message:
            "Fill in the blanks questions must have at least one blank (___) in the question.",
        };
      }
      break;

    case "ordering":
      if (!question.orderedItems || !Array.isArray(question.orderedItems)) {
        return {
          isValid: false,
          message: "Ordering questions must have an orderedItems array.",
        };
      }
      if (
        question.orderedItems.length < 2 ||
        question.orderedItems.some((i) => !i.trim())
      ) {
        return {
          isValid: false,
          message: "You must provide at least 2 non-empty items for ordering.",
        };
      }
      break;

    case "matrix":
      if (
        !question.matrixOptions ||
        !question.matrixOptions.rows ||
        !question.matrixOptions.cols
      ) {
        return {
          isValid: false,
          message: "Matrix questions must have rows and columns defined.",
        };
      }
      if (
        !Array.isArray(question.matrixOptions.rows) ||
        !Array.isArray(question.matrixOptions.cols)
      ) {
        return {
          isValid: false,
          message: "Matrix rows and columns must be arrays.",
        };
      }
      if (
        question.matrixOptions.rows.length < 1 ||
        question.matrixOptions.cols.length < 1
      ) {
        return {
          isValid: false,
          message: "Matrix must have at least one row and one column.",
        };
      }
      if (
        question.matrixOptions.rows.some((r) => !r.id || !r.text.trim()) ||
        question.matrixOptions.cols.some((c) => !c.id || !c.text.trim())
      ) {
        return {
          isValid: false,
          message:
            "All matrix rows and columns must have IDs and non-empty text.",
        };
      }
      if (
        !question.correctAnswer ||
        typeof question.correctAnswer !== "object"
      ) {
        return {
          isValid: false,
          message: "Matrix questions must have a correctAnswer mapping object.",
        };
      }
      if (
        Object.keys(question.correctAnswer).length !==
        question.matrixOptions.rows.length
      ) {
        return {
          isValid: false,
          message:
            "Each row in the matrix must have exactly one correct answer.",
        };
      }
      for (const [rowId, colId] of Object.entries(question.correctAnswer)) {
        if (
          !question.matrixOptions.rows.some((r) => r.id === rowId) ||
          !question.matrixOptions.cols.some((c) => c.id === colId)
        ) {
          return {
            isValid: false,
            message:
              "Matrix correct answers must reference valid row and column IDs.",
          };
        }
      }
      break;

    case "drag-drop":
      if (
        !question.draggableItems ||
        !Array.isArray(question.draggableItems) ||
        !question.dropZones ||
        !Array.isArray(question.dropZones)
      ) {
        return {
          isValid: false,
          message:
            "Drag and drop questions must have draggableItems and dropZones arrays.",
        };
      }
      const filledItems = question.draggableItems.filter(
        (i) => i.id && i.text.trim()
      );
      const filledZones = question.dropZones.filter(
        (z) => z.id && z.text.trim()
      );
      if (filledItems.length < 1 || filledZones.length < 1) {
        return {
          isValid: false,
          message:
            "You must have at least one valid draggable item and one drop zone.",
        };
      }
      if (
        !question.correctMapping ||
        typeof question.correctMapping !== "object"
      ) {
        return {
          isValid: false,
          message: "Drag and drop questions must have a correctMapping object.",
        };
      }
      for (const [itemId, zoneId] of Object.entries(question.correctMapping)) {
        if (
          !question.draggableItems.some((i) => i.id === itemId) ||
          !question.dropZones.some((z) => z.id === zoneId)
        ) {
          return {
            isValid: false,
            message:
              "Drag and drop mappings must reference valid item and zone IDs.",
          };
        }
      }
      break;

    case "image-based":
      if (!question.imageUrl || !question.imageUrl.trim()) {
        return {
          isValid: false,
          message: "Image-based questions must have an image URL.",
        };
      }
      if (
        !question.correctAnswer ||
        (typeof question.correctAnswer === "string" &&
          !question.correctAnswer.trim())
      ) {
        return {
          isValid: false,
          message: "Image-based questions must have a correct answer.",
        };
      }
      break;

    case "code-output":
      if (!question.codeSnippet || !question.codeSnippet.trim()) {
        return {
          isValid: false,
          message: "Code output questions must have a code snippet.",
        };
      }
      if (
        !question.correctAnswer ||
        (typeof question.correctAnswer === "string" &&
          !question.correctAnswer.trim())
      ) {
        return {
          isValid: false,
          message: "Code output questions must have a correct answer.",
        };
      }
      break;

    case "paragraph":
    case "essay":
      // These types only need the basic validations that were done above
      break;
    case "audio":
      // Allow if audioUrl is missing (student will upload/record answer)
      // Optionally: check for correctAnswer if needed
      break;
    case "video":
      // Allow if videoUrl is missing (student will upload/record answer)
      // Optionally: check for correctAnswer if needed
      break;
    case "poll":
      if (!question.options || !Array.isArray(question.options)) {
        return {
          isValid: false,
          message: "Poll questions must have an options array.",
        };
      }
      if (question.options.filter((o) => o.text.trim()).length < 2) {
        return {
          isValid: false,
          message: "Poll questions must have at least 2 non-empty options.",
        };
      }
      // No correct answer required for poll
      break;
    default:
      // If the type is in QUESTION_TYPES, allow it (future-proof)
      if (QUESTION_TYPE_IDS.includes(question.type)) {
        return { isValid: true, message: "Question is valid." };
      }
      return {
        isValid: false,
        message: `Unknown question type: ${question.type}`,
      };
  }

  return { isValid: true, message: "Question is valid." };
};

function CreateQuizPageComponent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [quizData, setQuizData] = useState<QuizData>({
    quizTitle: "",
    tags: [],
    questions: [],
    totalMarks: 100,
    equalMarks: true,
    marksPerQuestion: 10,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFactoryModal, setShowFactoryModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<
    number | null
  >(null);
  const [showMyTemplatesDialog, setShowMyTemplatesDialog] = useState(false);
  const [questionPanelView, setQuestionPanelView] = useState<"grid" | "list">(
    "grid"
  );

  // Sparkle state for animated background stars
  const [sparkles, setSparkles] = useState<
    {
      top: number;
      left: number;
      opacity: number;
      duration: number;
      delay: number;
    }[]
  >([]);

  useEffect(() => {
    setSparkles(
      Array.from({ length: 40 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.7 + 0.2,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  useEffect(() => {
    if (!searchParams) return; // Add null check here
    const quizId = searchParams.get("id");
    if (quizId) {
      const fetchQuiz = async () => {
        // setIsLoading(true);
        try {
          const response = await fetch(`/api/quizzes/templates/${quizId}`);
          if (!response.ok) {
            throw new Error("Quiz not found or not authorized");
          }
          const data = await response.json();

          let questions = [];
          if (data.jsonContent) {
            // New format: { questions: [...] }
            if (Array.isArray(data.jsonContent.questions)) {
              questions = data.jsonContent.questions;
            }
            // Old format: [...]
            else if (Array.isArray(data.jsonContent)) {
              questions = data.jsonContent;
            }
          }

          // Fix duplicate IDs on load
          const origLen = questions.length;
          questions = fixDuplicateQuestionIds(questions);
          if (new Set(questions.map((q) => q.id)).size !== origLen) {
            toast.error("Duplicate question IDs found and fixed on load.");
          }

          setQuizData({
            quizTitle: data.title,
            tags: data.tags,
            questions: questions,
            totalMarks: questions.reduce(
              (sum: number, q: Question) => sum + (q.marks || 0),
              0
            ),
            equalMarks:
              new Set(questions.map((q: Question) => q.marks || 0)).size <= 1,
            marksPerQuestion:
              questions.length > 0 ? questions[0].marks || 10 : 10,
            // Advanced fields
            imageUrl: data.imageUrl || "",
            field: data.field || "",
            subject: data.subject || "",
            durationInSeconds:
              typeof data.durationInSeconds === "number"
                ? data.durationInSeconds
                : 0,
            isLocked: !!data.isLocked,
            lockPassword: data.lockPassword || "",
            difficultyLevel: data.difficultyLevel || "",
            price: typeof data.price === "number" ? data.price : 0,
          });
          toast.success("Quiz loaded successfully!");
        } catch (error) {
          toast.error("Failed to load quiz for editing.");
          console.error(error);
        } finally {
          // setIsLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [searchParams]);

  const handleAddNewQuestion = useCallback(
    (type: string) => {
      const newId = nanoid(); // instead of Date.now()
      const newQuestion: Question = {
        id: newId,
        type,
        question: "",
        explanation: "",
        timer: undefined,
        marks: quizData.equalMarks ? quizData.marksPerQuestion : 10,
      };

      // Initialize type-specific fields
      switch (type) {
        case "mcq-single":
        case "mcq-multiple":
        case "poll":
          newQuestion.options = [
            { id: `${newId}-opt-1`, text: "" },
            { id: `${newId}-opt-2`, text: "" },
          ];
          newQuestion.correctAnswer = type === "mcq-single" ? null : [];
          break;
        case "true-false":
          newQuestion.correctAnswer = true;
          break;
        case "match":
          newQuestion.matchPairs = [
            { id: `${newId}-pair-1`, premise: "", response: "" },
            { id: `${newId}-pair-2`, premise: "", response: "" },
          ];
          break;
        case "ordering":
          newQuestion.orderedItems = ["", ""];
          break;
        case "fill-blanks":
          newQuestion.fillBlanksAnswers = [];
          break;
        case "code-output":
          newQuestion.codeSnippet = "";
          newQuestion.correctAnswer = "";
          break;
        case "drag-drop":
          newQuestion.draggableItems = [{ id: `${newId}-item-1`, text: "" }];
          newQuestion.dropZones = [{ id: `${newId}-zone-1`, text: "" }];
          newQuestion.correctMapping = {};
          break;
        case "matrix":
          newQuestion.matrixOptions = {
            rows: [{ id: `${newId}-row-1`, text: "" }],
            cols: [{ id: `${newId}-col-1`, text: "" }],
          };
          newQuestion.correctAnswer = {};
          break;
        default:
          break;
      }

      setEditingQuestion(newQuestion);
      setShowQuestionModal(true);
      setAddingNew(false);
    },
    [quizData.equalMarks, quizData.marksPerQuestion]
  );

  const handleSaveQuestion = (savedQuestion: Question) => {
    const isExisting = quizData.questions.some(
      (q) => q.id === savedQuestion.id
    );

    if (isExisting) {
      updateQuestion(savedQuestion.id, savedQuestion);
    } else {
      setQuizData((prev) => ({
        ...prev,
        questions: [...prev.questions, savedQuestion],
      }));
      setCurrentQuestionIndex(quizData.questions.length);
    }

    setEditingQuestion(null);
    setShowQuestionModal(false);
  };

  const updateQuestion = useCallback(
    (questionId: string, updates: Partial<Question>) => {
      setQuizData((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      }));
    },
    []
  );

  const deleteQuestion = useCallback(
    (questionId: string) => {
      setQuizData((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      }));
      if (currentQuestionIndex >= quizData.questions.length - 1) {
        setCurrentQuestionIndex(Math.max(0, quizData.questions.length - 2));
      }
    },
    [currentQuestionIndex, quizData.questions.length]
  );

  const duplicateQuestion = useCallback((question: Question) => {
    const duplicatedQuestion: Question = {
      ...question,
      id: nanoid(),
      question: `${question.question} (Copy)`,
    };

    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion],
    }));
  }, []);

  const updateMarksDistribution = useCallback(
    (equalMarks: boolean, marksPerQuestion?: number) => {
      setQuizData((prev) => {
        const updatedQuestions = prev.questions.map((q) => ({
          ...q,
          marks: equalMarks
            ? marksPerQuestion || prev.marksPerQuestion
            : q.marks,
        }));

        return {
          ...prev,
          equalMarks,
          marksPerQuestion: marksPerQuestion || prev.marksPerQuestion,
          questions: updatedQuestions,
        };
      });
    },
    []
  );

  const downloadJSON = useCallback(() => {
    const dataStr = JSON.stringify(quizData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quizData.quizTitle || "quiz"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [quizData]);

  const importJSON = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Parse JSON and validate basic structure
          if (!e.target?.result) {
            toast.error("Failed to read file contents.");
            return;
          }

          let importedData: { questions?: Question[] } | Question[];
          try {
            importedData = JSON.parse(e.target.result as string);
          } catch (parseError) {
            toast.error("Invalid JSON format. Please check your file syntax.");
            console.error("JSON parse error:", parseError);
            return;
          }

          // Validate questions array
          const questionsToValidate = Array.isArray(importedData)
            ? importedData
            : (importedData as { questions?: Question[] }).questions || [];
          if (!Array.isArray(questionsToValidate)) {
            toast.error(
              "The file must contain a questions array or be an array of questions."
            );
            return;
          }
          if (questionsToValidate.length === 0) {
            toast.error("No questions found in the file.");
            return;
          }

          // Validate each question
          const validQuestions: Question[] = [];
          const invalidQuestions: { question: Question; reason: string }[] = [];
          const seenIds = new Set<string>();

          questionsToValidate.forEach((q: Question, index: number) => {
            // Check for duplicate IDs (in seenIds or already in quizData)
            if (
              seenIds.has(q.id) ||
              quizData.questions.some((existing) => existing.id === q.id)
            ) {
              invalidQuestions.push({
                question: q,
                reason: `Duplicate question ID: ${q.id}`,
              });
              return;
            }
            seenIds.add(q.id);

            // Validate question structure
            const validationResult = validateQuestion(q);
            if (validationResult.isValid) {
              validQuestions.push(q);
            } else {
              invalidQuestions.push({
                question: q,
                reason: `Question ${index + 1}: ${validationResult.message}`,
              });
            }
          });

          // Report results
          if (validQuestions.length > 0) {
            setQuizData((prev) => ({
              ...prev,
              questions: [...prev.questions, ...validQuestions],
            }));

            if (invalidQuestions.length === 0) {
              toast.success(
                `Successfully imported ${validQuestions.length} questions!`
              );
            } else {
              toast.error(
                `Imported ${validQuestions.length} valid questions. ${invalidQuestions.length} questions were invalid and skipped. Check console for details.`,
                { duration: 6000 }
              );
              console.warn("Invalid questions:", invalidQuestions);
            }
          } else {
            toast.error(
              `Import failed. All ${invalidQuestions.length} questions were invalid. Check console for details.`,
              { duration: 6000 }
            );
            console.error("All questions were invalid:", invalidQuestions);
          }

          setShowImportModal(false);
        } catch (error) {
          toast.error("An unexpected error occurred while importing the file.");
          console.error("Import error:", error);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read the file. Please try again.");
      };

      reader.readAsText(file);
    },
    [quizData.questions]
  );

  const totalMarks = quizData.questions.reduce(
    (sum, q) => sum + (q.marks || 0),
    0
  );

  const handleFinalizeAndSaveToServer = async (
    finalData: QuizData,
    isPublished: boolean
  ) => {
    if (!user?.id) {
      toast.error("You must be logged in to save a quiz.");
      return;
    }

    try {
      const response = await fetch("/api/quizzes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...finalData,
          isPublished,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save the quiz");
      }

      const newQuiz = await response.json();
      toast.success(
        isPublished ? "Quiz published successfully!" : "Quiz saved as draft!"
      );
      setShowFinalizeModal(false);
      // Redirect to the new quiz page using slug if available
      if (newQuiz.slug) {
        window.location.href = `/quizzes/${newQuiz.slug}`;
      } else {
        window.location.href = `/quizzes/${newQuiz.id}`;
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

  // const handleEditQuestion = (question: Question) => {
  //   setEditingQuestion({ ...question });
  // };

  return (
    <div className="relative min-h-screen flex flex-col bg-linear-to-br from-background to-white dark:from-[#0f1021] dark:via-[#23234d] dark:to-[#1a1a2e] pt-20 overflow-x-hidden">
      {/* Animated Orbs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-linear-to-br from-purple-500/30 to-blue-600/30 rounded-full blur-3xl animate-float z-0"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute top-1/2 right-0 w-72 h-72 bg-linear-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-2xl animate-float z-0"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "mirror",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-60 h-60 bg-linear-to-br from-yellow-500/20 to-orange-600/20 rounded-full blur-2xl animate-float z-0"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          repeatType: "mirror",
          delay: 4,
        }}
      />
      {/* Subtle Sparkle/Starfield Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {sparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/60"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              opacity: s.opacity,
            }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              repeatType: "mirror",
              delay: s.delay,
            }}
          />
        ))}
      </div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "",
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      {/* Top Action Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-cyan-400/20 shadow-[0_2px_24px_0_rgba(59,130,246,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 md:gap-0">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-glow">
                Create Your Quiz
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
              <button
                onClick={() => setAddingNew(true)}
                className="futuristic-button flex items-center gap-2 px-4 py-2"
                title="Add Question"
              >
                <FiPlus />
                <span>Add</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="futuristic-button flex items-center gap-2 px-4 py-2 bg-cyan-100 text-blue-900 border border-cyan-300 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-100 dark:border-cyan-400/30 dark:hover:bg-cyan-800"
              >
                <FiUpload className="text-blue-400" />
                <span>Import</span>
              </button>
              <button
                onClick={() => setShowMyTemplatesDialog(true)}
                className="futuristic-button flex items-center gap-2 px-4 py-2 bg-cyan-100 text-blue-900 border border-cyan-300 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-100 dark:border-cyan-400/30 dark:hover:bg-cyan-800"
              >
                <FiFolder className="text-green-400" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setShowFactoryModal(true)}
                className="futuristic-button flex items-center gap-2 px-4 py-2 bg-cyan-100 text-blue-900 border border-cyan-300 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-100 dark:border-cyan-400/30 dark:hover:bg-cyan-800"
              >
                <FiPackage className="text-purple-400" />
                <span>My Factory</span>
              </button>
              <button
                onClick={() => setShowMarksModal(true)}
                className="futuristic-button flex items-center gap-2 px-4 py-2 bg-cyan-100 text-blue-900 border border-cyan-300 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-100 dark:border-cyan-400/30 dark:hover:bg-cyan-800"
              >
                <FiDollarSign className="text-yellow-400" />
                <span>Marks ({totalMarks})</span>
              </button>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (quizData.questions.length < 2) {
                      toast.error("add at least 2 questions to continue");
                    } else {
                      setShowFinalizeModal(true);
                    }
                  }}
                  className="futuristic-button flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-400 text-white border-none hover:from-blue-600 hover:to-cyan-500"
                >
                  <FiSave />
                  <span>Save</span>
                </button>
                <button
                  onClick={downloadJSON}
                  className="futuristic-button flex items-center gap-2 px-4 py-2 bg-cyan-100 text-blue-900 border border-cyan-300 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-100 dark:border-cyan-400/30 dark:hover:bg-cyan-800"
                >
                  <FiDownload />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
          {/* Left Sidebar - Question Grid/List Toggle */}
          <div
            className={`transition-all duration-300 mb-6 md:mb-0 ${
              questionPanelView === "grid"
                ? "col-span-12 md:col-span-4"
                : "col-span-12 md:col-span-4"
            } min-w-0 md:min-w-[280px]`}
          >
            <div className="bg-white/10 bg-clip-padding backdrop-blur-xl rounded-3xl p-4 pt-8 border border-white/10 shadow-xl flex flex-col mb-6 h-full">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-lg font-bold tracking-wide text-blue-900 dark:text-cyan-100">
                  Questions
                </h3>
                <div className="inline-flex rounded-full bg-white/10 border border-white/20 shadow-sm overflow-hidden ml-2">
                  <button
                    className={`px-3 py-1 flex items-center gap-2 transition-all ${
                      questionPanelView === "grid"
                        ? "bg-linear-to-r from-purple-500 to-blue-500 text-white"
                        : "text-white/60 hover:bg-white/10"
                    }`}
                    onClick={() => setQuestionPanelView("grid")}
                    aria-label="Grid View"
                    type="button"
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    className={`px-3 py-1 flex items-center gap-2 transition-all ${
                      questionPanelView === "list"
                        ? "bg-linear-to-r from-purple-500 to-blue-500 text-white"
                        : "text-white/60 hover:bg-white/10"
                    }`}
                    onClick={() => setQuestionPanelView("list")}
                    aria-label="List View"
                    type="button"
                  >
                    <FiList size={18} />
                  </button>
                </div>
              </div>
              <div
                className={
                  questionPanelView === "grid"
                    ? "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-3"
                    : "space-y-3"
                }
              >
                {quizData.questions.map((question, index) => {
                  const isExpanded = expandedQuestionIndex === index;
                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group rounded-2xl cursor-pointer border border-white/10 transition-all duration-300 ${
                        questionPanelView === "grid"
                          ? "flex flex-col items-center justify-center px-0 py-6 min-h-[60px] text-lg font-bold"
                          : "flex flex-col px-3 py-2"
                      } shadow-sm hover:shadow-lg hover:bg-white/10 ${
                        questionPanelView === "grid"
                          ? "bg-linear-to-r from-purple-500/30 to-blue-500/30 border-purple-400/40 shadow-lg"
                          : "bg-white/5"
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                      whileHover={{ scale: 1.03 }}
                    >
                      {questionPanelView === "grid" ? (
                        <span className="text-base font-semibold text-white/90">
                          Q{index + 1}
                        </span>
                      ) : (
                        <>
                          <div className="flex items-center w-full gap-2">
                            <span className="text-base font-semibold text-white/90">
                              Q{index + 1}
                            </span>
                            <span className="text-xs bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded-full font-semibold">
                              {question.marks || 0}{" "}
                              {question.marks === 1 ? "pt" : "pts"}
                            </span>
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateQuestion(question);
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                                title="Duplicate"
                              >
                                <FiRotateCcw size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedQuestionIndex(
                                    isExpanded ? null : index
                                  );
                                }}
                                className="p-1 hover:bg-white/20 rounded-full"
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                >
                                  <FiChevronDown size={16} />
                                </motion.div>
                              </button>
                            </div>
                          </div>
                          <motion.div
                            initial={false}
                            animate={{
                              height: isExpanded ? "auto" : 0,
                              opacity: isExpanded ? 1 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {isExpanded && (
                              <span className="block mt-3 mb-1 text-sm text-white/90 font-medium bg-white/10 rounded-xl px-3 py-2 shadow-inner">
                                {question.question || (
                                  <span className="italic text-white/50">
                                    Untitled Question
                                  </span>
                                )}
                              </span>
                            )}
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Section - Question Editor */}
          <div
            className={`${
              questionPanelView === "grid"
                ? "col-span-12 md:col-span-8"
                : "col-span-12 md:col-span-8"
            } min-w-0 md:min-w-[400px]`}
          >
            <div className="bg-white/5 rounded-2xl p-4 sm:p-8 border border-white/10 backdrop-blur-xl h-full">
              {addingNew ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold mb-4">
                    Choose Question Type
                  </h3>
                  <p className="text-white/60 mb-8">
                    Select a question type to add to your quiz
                  </p>
                  {/* Question Type Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {QUESTION_TYPES.map((type) => (
                      <motion.button
                        key={type.id}
                        onClick={() => handleAddNewQuestion(type.id)}
                        className="p-6 rounded-xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <div className="text-sm font-medium">{type.name}</div>
                      </motion.button>
                    ))}
                  </div>
                  <button
                    onClick={() => setAddingNew(false)}
                    className="mt-8 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : quizData.questions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold mb-4">
                    Start Building Your Quiz
                  </h3>
                  <p className="text-white/60 mb-8">
                    Choose a question type to begin creating your quiz
                  </p>
                  {/* Question Type Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {QUESTION_TYPES.map((type) => (
                      <motion.button
                        key={type.id}
                        onClick={() => handleAddNewQuestion(type.id)}
                        className="p-6 rounded-xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <div className="text-sm font-medium">{type.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">
                      Question {currentQuestionIndex + 1} of{" "}
                      {quizData.questions.length}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowQuestionModal(true)}
                        className="px-4 py-2 bg-linear-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                      >
                        Edit Question
                      </button>
                      <button
                        onClick={() =>
                          deleteQuestion(
                            quizData.questions[currentQuestionIndex].id
                          )
                        }
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Question Preview */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-2">Question:</h4>
                      <p className="text-white/80">
                        {quizData.questions[currentQuestionIndex]?.question ||
                          "No question text"}
                      </p>
                    </div>
                    <QuestionPreview
                      question={quizData.questions[currentQuestionIndex]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Finalization Button - This is now triggered from the top bar 'Save' button */}
      {/* 
        {quizData.questions.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowFinalizeModal(true)}
              className="px-8 py-4 bg-linear-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-lg font-semibold shadow-lg"
            >
              Finalize & Save Quiz
            </button>
          </div>
        )}
      */}

      {/* Question Editor Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <QuestionEditorModal
            question={
              editingQuestion ||
              quizData.questions[currentQuestionIndex] || {
                id: "",
                type: "mcq-single",
                question: "",
                options: [{ id: "1", text: "" }],
                correctAnswer: null,
                explanation: "",
                timer: undefined,
              }
            }
            onSave={handleSaveQuestion}
            onClose={() => {
              setShowQuestionModal(false);
              setEditingQuestion(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Finalization Modal */}
      <AnimatePresence>
        {showFinalizeModal && (
          <FinalizeModal
            quizData={quizData}
            onSave={handleFinalizeAndSaveToServer}
            onClose={() => setShowFinalizeModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <ImportModal
            onImport={importJSON}
            onClose={() => setShowImportModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Factory Modal */}
      <AnimatePresence>
        {showFactoryModal && (
          <FactoryDialog onClose={() => setShowFactoryModal(false)} />
        )}
      </AnimatePresence>

      {/* Marks Modal */}
      <AnimatePresence>
        {showMarksModal && (
          <MarksModal
            quizData={quizData}
            onUpdate={updateMarksDistribution}
            onClose={() => setShowMarksModal(false)}
          />
        )}
      </AnimatePresence>

      {/* My Templates Dialog */}
      {showMyTemplatesDialog && (
        <MyTemplateDialog onClose={() => setShowMyTemplatesDialog(false)} />
      )}
    </div>
  );
}

// Modal Components
function QuestionEditorModal({
  question,
  onSave,
  onClose,
}: {
  question: Question;
  onSave: (question: Question) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(question);
  const questionType = QUESTION_TYPES.find((type) => type.id === question.type);

  const handleSave = () => {
    // First, validate the question
    const validationResult = validateQuestion(formData);
    if (!validationResult.isValid) {
      toast.error(validationResult.message);
      return; // Stop the save process
    }

    // Filter out empty options/pairs before saving
    const cleanedData = { ...formData };
    if (cleanedData.options) {
      cleanedData.options = cleanedData.options.filter(
        (opt) => opt.text.trim() !== ""
      );
    }
    if (cleanedData.matchPairs) {
      cleanedData.matchPairs = cleanedData.matchPairs.filter(
        (p) => p.premise.trim() !== "" && p.response.trim() !== ""
      );
    }
    if (cleanedData.orderedItems) {
      cleanedData.orderedItems = cleanedData.orderedItems.filter(
        (item) => item.trim() !== ""
      );
    }
    if (cleanedData.fillBlanksAnswers) {
      cleanedData.fillBlanksAnswers = cleanedData.fillBlanksAnswers.filter(
        (ans) => ans.trim() !== ""
      );
    }
    onSave(cleanedData);
    toast.success("Question saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Question
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-white transition-colors"
          >
            <FiX />
          </button>
        </div>

        {/* Question Type Guide (restored) */}
        {questionType && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{questionType.icon}</span>
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {questionType.name}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-white/80">
              {questionType.guide}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
              Question Text
            </label>
            <textarea
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
              rows={3}
              placeholder="Enter your question..."
            />
          </div>

          {/* Marks */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
              Marks
            </label>
            <input
              type="number"
              value={formData.marks || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  marks: parseInt(e.target.value) || 0,
                })
              }
              className="w-32 p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white"
              min="0"
              placeholder="10"
            />
          </div>

          {/* Question Type Specific Settings */}
          <QuestionSettings
            editorType={formData.type}
            formData={formData}
            setFormData={setFormData}
          />

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation || ""}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              className="w-full p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
              rows={2}
              placeholder="Explain the correct answer..."
            />
          </div>

          {/* Timer */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
              Timer (seconds, optional)
            </label>
            <input
              type="number"
              value={formData.timer || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timer: parseInt(e.target.value) || undefined,
                })
              }
              className="w-32 p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
              placeholder="Leave empty for no timer"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 text-gray-700 dark:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-linear-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-white"
          >
            Save Question
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Settings component for different question types
function QuestionSettings({
  editorType,
  formData,
  setFormData,
}: {
  editorType: string;
  formData: Question;
  setFormData: React.Dispatch<React.SetStateAction<Question>>;
}) {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [
      ...(formData.options || []),
      { id: `opt-${Date.now()}`, text: "" },
    ];
    setFormData({ ...formData, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(formData.options || [])];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectChange = (value: unknown) => {
    setFormData({ ...formData, correctAnswer: value });
  };

  const handleMultipleCorrectChange = (optionId: string) => {
    const currentCorrect = (
      Array.isArray(formData.correctAnswer) ? formData.correctAnswer : []
    ) as string[];
    const newCorrect = currentCorrect.includes(optionId)
      ? currentCorrect.filter((id: string) => id !== optionId)
      : [...currentCorrect, optionId];
    setFormData({ ...formData, correctAnswer: newCorrect });
  };

  // --- Handlers for Matching ---
  const handleMatchPairChange = (
    index: number,
    field: "premise" | "response",
    value: string
  ) => {
    const newPairs = [...(formData.matchPairs || [])];
    newPairs[index][field] = value;
    setFormData({ ...formData, matchPairs: newPairs });
  };

  const addMatchPair = () => {
    const newPairs = [
      ...(formData.matchPairs || []),
      { id: `pair-${Date.now()}`, premise: "", response: "" },
    ];
    setFormData({ ...formData, matchPairs: newPairs });
  };

  const removeMatchPair = (index: number) => {
    const newPairs = [...(formData.matchPairs || [])];
    newPairs.splice(index, 1);
    setFormData({ ...formData, matchPairs: newPairs });
  };

  // --- Handlers for Ordering ---
  const handleOrderedItemChange = (index: number, value: string) => {
    const newItems = [...(formData.orderedItems || [])];
    newItems[index] = value;
    setFormData({ ...formData, orderedItems: newItems });
  };

  const addOrderedItem = () => {
    const newItems = [...(formData.orderedItems || []), ""];
    setFormData({ ...formData, orderedItems: newItems });
  };

  const removeOrderedItem = (index: number) => {
    const newItems = [...(formData.orderedItems || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, orderedItems: newItems });
  };

  // --- Handlers for Fill Blanks ---
  const handleFillBlankAnswerChange = (index: number, value: string) => {
    const newAnswers = [...(formData.fillBlanksAnswers || [])];
    newAnswers[index] = value;
    setFormData({ ...formData, fillBlanksAnswers: newAnswers });
  };

  const addFillBlankAnswer = () => {
    const newAnswers = [...(formData.fillBlanksAnswers || []), ""];
    setFormData({ ...formData, fillBlanksAnswers: newAnswers });
  };

  const removeFillBlankAnswer = (index: number) => {
    const newAnswers = [...(formData.fillBlanksAnswers || [])];
    newAnswers.splice(index, 1);
    setFormData({ ...formData, fillBlanksAnswers: newAnswers });
  };

  // --- Handlers for Drag & Drop ---
  const handleDragDropChange = (
    type: "draggableItems" | "dropZones",
    index: number,
    value: string
  ) => {
    const newItems = [...(formData[type] || [])];
    newItems[index].text = value;
    setFormData({ ...formData, [type]: newItems });
  };

  const addDragDropItem = (type: "draggableItems" | "dropZones") => {
    const newItems = [
      ...(formData[type] || []),
      { id: `${type}-${Date.now()}`, text: "" },
    ];
    setFormData({ ...formData, [type]: newItems });
  };

  const removeDragDropItem = (
    type: "draggableItems" | "dropZones",
    index: number
  ) => {
    const newItems = [...(formData[type] || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, [type]: newItems });
  };

  const handleDragDropMapping = (itemId: string, zoneId: string) => {
    const newMapping = { ...(formData.correctMapping || {}) };
    if (zoneId === "unassigned") {
      delete newMapping[itemId];
    } else {
      newMapping[itemId] = zoneId;
    }
    setFormData({ ...formData, correctMapping: newMapping });
  };

  // --- Handlers for Matrix ---
  const handleMatrixChange = (
    type: "rows" | "cols",
    index: number,
    value: string
  ) => {
    const newMatrixOptions = {
      ...(formData.matrixOptions || { rows: [], cols: [] }),
    };
    newMatrixOptions[type][index].text = value;
    setFormData({ ...formData, matrixOptions: newMatrixOptions });
  };

  const addMatrixItem = (type: "rows" | "cols") => {
    const newMatrixOptions = {
      ...(formData.matrixOptions || { rows: [], cols: [] }),
    };
    newMatrixOptions[type].push({ id: `item-${Date.now()}`, text: "" });
    setFormData({ ...formData, matrixOptions: newMatrixOptions });
  };

  const removeMatrixItem = (type: "rows" | "cols", index: number) => {
    const newMatrixOptions = {
      ...(formData.matrixOptions || { rows: [], cols: [] }),
    };
    newMatrixOptions[type].splice(index, 1);
    setFormData({ ...formData, matrixOptions: newMatrixOptions });
  };

  const handleMatrixCorrectChange = (rowId: string, colId: string) => {
    const newCorrectAnswer = (
      typeof formData.correctAnswer === "object" &&
      !Array.isArray(formData.correctAnswer)
        ? { ...(formData.correctAnswer as Record<string, string>) }
        : {}
    ) as Record<string, string>;
    newCorrectAnswer[rowId] = colId;
    setFormData({ ...formData, correctAnswer: newCorrectAnswer });
  };

  switch (editorType) {
    case "mcq-single":
    case "mcq-multiple":
      return (
        <div>
          <label className="block text-sm font-medium mb-3">
            Options & Correct Answer
          </label>
          <div className="space-y-3">
            {formData.options?.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3">
                {editorType === "mcq-single" ? (
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={formData.correctAnswer === option.id}
                    onChange={() => handleCorrectChange(option.id)}
                    className="form-radio h-5 w-5 text-purple-500 bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 focus:ring-purple-500"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={(Array.isArray(formData.correctAnswer)
                      ? (formData.correctAnswer as string[])
                      : []
                    ).includes(option.id)}
                    onChange={() => handleMultipleCorrectChange(option.id)}
                    className="form-checkbox h-5 w-5 text-purple-500 bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 rounded focus:ring-purple-500"
                  />
                )}
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-white"
          >
            <FiPlus /> Add Option
          </button>
        </div>
      );

    case "true-false":
      return (
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-white">
            Correct Answer
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white">
              <input
                type="radio"
                name="trueFalse"
                checked={formData.correctAnswer === true}
                onChange={() => handleCorrectChange(true)}
                className="form-radio h-5 w-5 text-purple-500 bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20"
              />
              <span>True</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white">
              <input
                type="radio"
                name="trueFalse"
                checked={formData.correctAnswer === false}
                onChange={() => handleCorrectChange(false)}
                className="form-radio h-5 w-5 text-purple-500 bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20"
              />
              <span>False</span>
            </label>
          </div>
        </div>
      );

    case "match":
      return (
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-white">
            Matching Pairs
          </label>
          <p className="text-xs text-gray-600 dark:text-white/60 mb-3">
            Enter the pairs that should be matched. The order will be randomized
            for the student.
          </p>
          <div className="space-y-3">
            {formData.matchPairs?.map((pair, index) => (
              <div key={pair.id} className="flex items-center gap-3">
                <input
                  type="text"
                  value={pair.premise}
                  onChange={(e) =>
                    handleMatchPairChange(index, "premise", e.target.value)
                  }
                  className="flex-1 p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                  placeholder={`Premise ${index + 1}`}
                />
                <span className="text-gray-500 dark:text-white/60">↔</span>
                <input
                  type="text"
                  value={pair.response}
                  onChange={(e) =>
                    handleMatchPairChange(index, "response", e.target.value)
                  }
                  className="flex-1 p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                  placeholder={`Response ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeMatchPair(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMatchPair}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-white"
          >
            <FiPlus /> Add Pair
          </button>
        </div>
      );

    case "drag-drop":
      return (
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-white">
            Drag & Drop Configuration
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Draggable Items */}
            <div>
              <h4 className="text-gray-800 dark:text-white/80 font-semibold mb-2">
                Draggable Items
              </h4>
              <div className="space-y-2">
                {formData.draggableItems?.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        handleDragDropChange(
                          "draggableItems",
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1 p-2 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                      placeholder={`Item ${index + 1}`}
                    />
                    <button
                      onClick={() =>
                        removeDragDropItem("draggableItems", index)
                      }
                      className="text-red-400 p-1 rounded-full hover:bg-red-500/20"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addDragDropItem("draggableItems")}
                className="mt-2 text-sm flex items-center gap-1 text-purple-400 hover:text-purple-300"
              >
                <FiPlus /> Add Item
              </button>
            </div>
            {/* Drop Zones (Categories) */}
            <div>
              <h4 className="text-gray-800 dark:text-white/80 font-semibold mb-2">
                Drop Zones (Categories)
              </h4>
              <div className="space-y-2">
                {formData.dropZones?.map((zone, index) => (
                  <div key={zone.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={zone.text}
                      onChange={(e) =>
                        handleDragDropChange("dropZones", index, e.target.value)
                      }
                      className="flex-1 p-2 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
                      placeholder={`Zone ${index + 1}`}
                    />
                    <button
                      onClick={() => removeDragDropItem("dropZones", index)}
                      className="text-red-400 p-1 rounded-full hover:bg-red-500/20"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addDragDropItem("dropZones")}
                className="mt-2 text-sm flex items-center gap-1 text-purple-400 hover:text-purple-300"
              >
                <FiPlus /> Add Zone
              </button>
            </div>
          </div>

          {/* Mapping */}
          <div className="mt-6">
            <h4 className="text-gray-800 dark:text-white/80 font-semibold mb-2">
              Assign Items to Zones
            </h4>
            <p className="text-xs text-gray-600 dark:text-white/60 mb-3">
              For each item, select the correct zone it belongs to. Items
              without an assignment are considered distractors.
            </p>
            <div className="space-y-3">
              {formData.draggableItems
                ?.filter((i) => i.text.trim() !== "")
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
                  >
                    <span className="font-medium flex-1 text-gray-900 dark:text-white">
                      {item.text}
                    </span>
                    <select
                      value={formData.correctMapping?.[item.id] || "unassigned"}
                      onChange={(e) =>
                        handleDragDropMapping(item.id, e.target.value)
                      }
                      className="p-2 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white"
                    >
                      <option value="unassigned">
                        Unassigned (Distractor)
                      </option>
                      {formData.dropZones
                        ?.filter((z) => z.text.trim() !== "")
                        .map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.text}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
            </div>
          </div>
        </div>
      );

    case "ordering":
      return (
        <div>
          <label className="block text-sm font-medium mb-3">
            Items to Order
          </label>
          <p className="text-xs text-white/60 mb-3">
            Enter the items in the correct sequence. The order will be
            randomized for the student.
          </p>
          <div className="space-y-3">
            {formData.orderedItems?.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-white/60 font-medium">{index + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleOrderedItemChange(index, e.target.value)
                  }
                  className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none"
                  placeholder={`Item ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOrderedItem(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOrderedItem}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiPlus /> Add Item
          </button>
        </div>
      );

    case "fill-blanks":
      return (
        <div>
          <label className="block text-sm font-medium mb-3">
            Correct Answers for Blanks
          </label>
          <p className="text-xs text-white/60 mb-3">
            In the question text, use three underscores `___` to denote a blank.
            Then, provide the list of correct answers below in the same order.
          </p>
          <div className="space-y-3">
            {formData.fillBlanksAnswers?.map((answer, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-white/60 font-medium">{index + 1}.</span>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) =>
                    handleFillBlankAnswerChange(index, e.target.value)
                  }
                  className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none"
                  placeholder={`Answer for blank ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeFillBlankAnswer(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFillBlankAnswer}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiPlus /> Add Answer
          </button>
        </div>
      );

    case "poll":
      return (
        <div>
          <label className="block text-sm font-medium mb-3">Poll Options</label>
          <p className="text-xs text-white/60 mb-3">
            These are the choices users can vote on. There are no correct
            answers.
          </p>
          <div className="space-y-3">
            {formData.options?.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 p-3 bg-white/10 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <FiPlus /> Add Option
          </button>
        </div>
      );

    case "code-output":
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Code Snippet</label>
          <p className="text-xs text-white/60 mb-3">
            The user will see this code snippet below the question text.
          </p>
          <textarea
            value={formData.codeSnippet || ""}
            onChange={(e) =>
              setFormData({ ...formData, codeSnippet: e.target.value })
            }
            className="w-full p-3 bg-black/50 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none font-mono text-sm"
            rows={8}
            placeholder="Enter the code snippet here..."
          />
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Expected Output
            </label>
            <textarea
              value={
                typeof formData.correctAnswer === "string"
                  ? formData.correctAnswer
                  : ""
              }
              onChange={(e) => handleCorrectChange(e.target.value)}
              className="w-full p-3 bg-black/50 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none font-mono text-sm"
              rows={3}
              placeholder="Enter the exact expected output..."
            />
          </div>
        </div>
      );

    case "image-based":
    case "audio":
    case "video":
      const urlType = editorType.split("-")[0]; // image, audio, video
      const urlKey = `${urlType}Url` as "imageUrl" | "audioUrl" | "videoUrl";
      return (
        <div>
          <label className="block text-sm font-medium mb-2 text-capitalize text-gray-700 dark:text-white">
            {urlType} URL
          </label>
          <input
            type="url"
            value={formData[urlKey] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [urlKey]: e.target.value })
            }
            className="w-full p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50"
            placeholder={`https://example.com/your-${urlType}.jpg`}
          />
          {formData[urlKey] && (
            <div className="mt-4">
              {urlType === "image" && (
                <div className="relative max-h-48 w-full rounded-lg overflow-hidden">
                  <Image
                    src={formData[urlKey]}
                    alt="preview"
                    width={400}
                    height={192}
                    className="rounded-lg object-contain"
                  />
                </div>
              )}
              {urlType === "audio" && (
                <audio src={formData[urlKey]} controls className="w-full" />
              )}
              {urlType === "video" && (
                <video
                  src={formData[urlKey]}
                  controls
                  className="max-h-48 rounded-lg"
                />
              )}
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Correct Answer
            </label>
            <input
              type="text"
              value={
                typeof formData.correctAnswer === "string"
                  ? formData.correctAnswer
                  : ""
              }
              onChange={(e) => handleCorrectChange(e.target.value)}
              className="w-full p-3 bg-white/10 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none"
              placeholder="Enter the correct answer"
            />
          </div>
        </div>
      );

    case "essay":
      return (
        <div>
          <label className="block text-sm font-medium mb-2">
            Word Limit (Optional)
          </label>
          <input
            type="number"
            value={
              typeof formData.correctAnswer === "number" ||
              typeof formData.correctAnswer === "string"
                ? formData.correctAnswer
                : ""
            }
            onChange={(e) =>
              handleCorrectChange(parseInt(e.target.value) || undefined)
            }
            className="w-32 p-3 bg-white/10 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none"
            placeholder="e.g., 500"
          />
          <p className="text-xs text-white/60 mt-2">
            Leave blank for no word limit. This question requires manual
            grading.
          </p>
        </div>
      );

    case "paragraph":
      return (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
          <p className="text-blue-300">
            This question type requires manual grading. No specific settings are
            required.
          </p>
        </div>
      );

    case "matrix":
      return (
        <div>
          <label className="block text-sm font-medium mb-3">
            Matrix Configuration
          </label>
          <div className="grid grid-cols-2 gap-6">
            {/* Row Configuration */}
            <div>
              <h4 className="text-white/80 font-semibold mb-2">Rows</h4>
              <div className="space-y-2">
                {formData.matrixOptions?.rows.map((row, index) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.text}
                      onChange={(e) =>
                        handleMatrixChange("rows", index, e.target.value)
                      }
                      className="flex-1 p-2 bg-white/10 rounded-lg border border-white/20"
                      placeholder={`Row ${index + 1}`}
                    />
                    <button
                      onClick={() => removeMatrixItem("rows", index)}
                      className="text-red-400 p-1 rounded-full hover:bg-red-500/20"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addMatrixItem("rows")}
                className="mt-2 text-sm flex items-center gap-1 text-purple-400 hover:text-purple-300"
              >
                <FiPlus /> Add Row
              </button>
            </div>
            {/* Column Configuration */}
            <div>
              <h4 className="text-white/80 font-semibold mb-2">Columns</h4>
              <div className="space-y-2">
                {formData.matrixOptions?.cols.map((col, index) => (
                  <div key={col.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={col.text}
                      onChange={(e) =>
                        handleMatrixChange("cols", index, e.target.value)
                      }
                      className="flex-1 p-2 bg-white/10 rounded-lg border border-white/20"
                      placeholder={`Column ${index + 1}`}
                    />
                    <button
                      onClick={() => removeMatrixItem("cols", index)}
                      className="text-red-400 p-1 rounded-full hover:bg-red-500/20"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addMatrixItem("cols")}
                className="mt-2 text-sm flex items-center gap-1 text-purple-400 hover:text-purple-300"
              >
                <FiPlus /> Add Column
              </button>
            </div>
          </div>

          {/* Matrix Answer Selection */}
          <div className="mt-6">
            <h4 className="text-white/80 font-semibold mb-2">
              Set Correct Answers
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    {formData.matrixOptions?.cols.map((col) => (
                      <th
                        key={col.id}
                        className="p-2 text-center text-white/80 font-normal"
                      >
                        {col.text || <span className="italic">Empty</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.matrixOptions?.rows.map((row) => (
                    <tr key={row.id} className="border-t border-white/10">
                      <td className="p-2 font-medium text-white/90">
                        {row.text || <span className="italic">Empty</span>}
                      </td>
                      {formData.matrixOptions?.cols.map((col) => (
                        <td key={col.id} className="p-2 text-center">
                          <input
                            type="radio"
                            name={`matrix-row-${row.id}`}
                            checked={
                              (typeof formData.correctAnswer === "object" &&
                              !Array.isArray(formData.correctAnswer)
                                ? (
                                    formData.correctAnswer as Record<
                                      string,
                                      string
                                    >
                                  )[row.id]
                                : undefined) === col.id
                            }
                            onChange={() =>
                              handleMatrixCorrectChange(row.id, col.id)
                            }
                            className="form-radio h-4 w-4 text-purple-500 bg-white/10 border-white/20"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
          <p className="text-yellow-300">
            Question settings for this type are not yet implemented.
          </p>
        </div>
      );
  }
}

// Comprehensive list of fields and subjects
const academicFields = {
  "Science & Technology": [
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Mathematics",
    "Engineering",
    "Environmental Science",
    "Astronomy",
    "Geology",
    "Information Technology",
    "Artificial Intelligence",
    "Robotics",
    "Biotechnology",
    "Electronics",
    "Data Science",
    "Cybersecurity",
    "Networking",
  ],
  "Arts & Humanities": [
    "Literature",
    "History",
    "Philosophy",
    "Languages",
    "Art History",
    "Music",
    "Theater",
    "Film Studies",
    "Cultural Studies",
    "Religious Studies",
    "Creative Writing",
    "Visual Arts",
    "Design",
    "Architecture",
  ],
  "Social Sciences": [
    "Psychology",
    "Sociology",
    "Economics",
    "Political Science",
    "Anthropology",
    "Geography",
    "Law",
    "Education",
    "Communication Studies",
    "International Relations",
    "Social Work",
    "Gender Studies",
  ],
  "Business & Management": [
    "Business Administration",
    "Marketing",
    "Finance",
    "Accounting",
    "Human Resources",
    "Entrepreneurship",
    "Project Management",
    "Operations Management",
    "Supply Chain Management",
    "Business Analytics",
  ],
  "Health & Medicine": [
    "Medicine",
    "Nursing",
    "Public Health",
    "Pharmacy",
    "Dentistry",
    "Veterinary Science",
    "Nutrition",
    "Physical Therapy",
    "Mental Health",
    "Healthcare Management",
    "Alternative Medicine",
  ],
  "Professional Skills": [
    "Leadership",
    "Communication",
    "Time Management",
    "Problem Solving",
    "Critical Thinking",
    "Teamwork",
    "Project Management",
    "Digital Skills",
    "Language Skills",
    "Presentation Skills",
  ],
};

// 1. Add DifficultyLevel options for dropdown
const DIFFICULTY_LEVELS = [
  { value: "SUPER_EASY", label: "Super Easy", color: "bg-green-500" },
  { value: "EASY", label: "Easy", color: "bg-lime-500" },
  { value: "NORMAL", label: "Normal", color: "bg-blue-400" },
  { value: "MEDIUM", label: "Medium", color: "bg-blue-600" },
  { value: "HARD", label: "Hard", color: "bg-orange-500" },
  { value: "IMPOSSIBLE", label: "Impossible", color: "bg-red-700" },
  { value: "INSANE", label: "Insane", color: "bg-fuchsia-700" },
  { value: "JEE_ADVANCED", label: "JEE (Advanced)", color: "bg-yellow-700" },
  { value: "JEE_MAIN", label: "JEE (Main)", color: "bg-yellow-500" },
  { value: "NEET_UG", label: "NEET (UG)", color: "bg-pink-500" },
  { value: "UPSC_CSE", label: "UPSC (CSE)", color: "bg-gray-700" },
  { value: "GATE", label: "GATE", color: "bg-cyan-700" },
  { value: "CAT", label: "CAT", color: "bg-orange-700" },
  { value: "CLAT", label: "CLAT", color: "bg-indigo-700" },
  { value: "CA", label: "CA", color: "bg-amber-700" },
  { value: "GAOKAO", label: "GAOKAO", color: "bg-red-500" },
  { value: "GRE", label: "GRE", color: "bg-blue-700" },
  { value: "GMAT", label: "GMAT", color: "bg-purple-700" },
  { value: "USMLE", label: "USMLE", color: "bg-teal-700" },
  { value: "LNAT", label: "LNAT", color: "bg-gray-500" },
  { value: "MCAT", label: "MCAT", color: "bg-emerald-700" },
  { value: "CFA", label: "CFA", color: "bg-green-700" },
  { value: "GOD_LEVEL", label: "GOD LEVEL", color: "bg-black" },
];

function FinalizeModal({
  quizData,
  onSave,
  onClose,
}: {
  quizData: QuizData;
  onSave: (data: QuizData, isPublished: boolean) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: quizData.quizTitle || "My Awesome Quiz",
    description: "",
    tags: quizData.tags.join(", "),
    imageUrl: "",
    price: 0,
    field: "",
    subject: "",
    durationInSeconds: 0,
    isLocked: false,
    lockPassword: "",
    difficultyLevel: "",
    durationUnit: "minutes", // for UI only
  });
  // Restore missing state for field/subject search
  const [fieldSearch, setFieldSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [durationError, setDurationError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [difficultySearch, setDifficultySearch] = useState("");
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const [showPasswordValue, setShowPasswordValue] = useState(false);

  useEffect(() => {
    if (!showDifficultyDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        difficultyDropdownRef.current &&
        !difficultyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDifficultyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDifficultyDropdown]);

  // Filter fields based on search
  const filteredFields = Object.keys(academicFields).filter((field) =>
    field.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  // Filter subjects based on search and selected field
  const filteredSubjects = formData.field
    ? [
        ...(academicFields[formData.field as keyof typeof academicFields] ||
          []),
      ].filter((subject) =>
        subject.toLowerCase().includes(subjectSearch.toLowerCase())
      )
    : [];

  // --- Duration logic ---
  const handleDurationChange = (value: string) => {
    const num = parseInt(value) || 0;
    setFormData((f) => ({
      ...f,
      durationInSeconds: num * (f.durationUnit === "minutes" ? 60 : 1),
    }));
  };
  const handleDurationUnitChange = (unit: string) => {
    setFormData((f) => ({
      ...f,
      durationUnit: unit,
      durationInSeconds:
        (parseInt(
          (f.durationInSeconds / (unit === "minutes" ? 60 : 1)).toString()
        ) || 0) * (unit === "minutes" ? 60 : 1),
    }));
  };

  // --- Password logic ---
  const handleLockToggle = () => {
    setFormData((f) => ({ ...f, isLocked: !f.isLocked, lockPassword: "" }));
    // setShowPassword((prev) => !prev);
    setPasswordError("");
  };

  // --- Difficulty logic ---
  const filteredDifficulties = DIFFICULTY_LEVELS.filter((d) =>
    d.label.toLowerCase().includes(difficultySearch.toLowerCase())
  );

  // --- Save logic ---
  const handleSave = async (isPublished: boolean) => {
    setDurationError("");
    setPasswordError("");
    // Validate duration
    if (
      formData.durationInSeconds > 0 &&
      (formData.durationInSeconds < 30 || formData.durationInSeconds > 10800)
    ) {
      setDurationError("Duration must be between 30 seconds and 180 minutes.");
      return;
    }
    // Validate password
    if (
      formData.isLocked &&
      (!formData.lockPassword || formData.lockPassword.length < 4)
    ) {
      setPasswordError("Password must be at least 4 characters.");
      return;
    }
    // Validate difficulty
    if (!formData.difficultyLevel) {
      toast.error("Please select a difficulty level.");
      return;
    }
    // ...existing required fields...
    if (!formData.title || !formData.field || !formData.subject) {
      toast.error("Please fill in Title, Field, and Subject.");
      return;
    }
    // Hash password if set
    let hashedPassword = "";
    if (formData.isLocked && formData.lockPassword) {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(formData.lockPassword, 10);
    }
    onSave(
      {
        ...formData,
        quizTitle: formData.title,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        questions: quizData.questions,
        durationInSeconds: formData.durationInSeconds,
        isLocked: formData.isLocked,
        lockPassword: hashedPassword || undefined,
        difficultyLevel: formData.difficultyLevel,
      },
      isPublished
    );
  };

  // Sync formData with quizData when quizData changes (unless user has started editing)
  useEffect(() => {
    setFormData((prev) => {
      // Only update if untouched or matches previous quizData
      const untouched =
        (!prev.title &&
          !prev.description &&
          !prev.tags &&
          !prev.imageUrl &&
          !prev.field &&
          !prev.subject) ||
        prev.title === (quizData.quizTitle || "My Awesome Quiz");
      if (untouched) {
        return {
          title: quizData.quizTitle || "My Awesome Quiz",
          description: quizData.description || "",
          tags: Array.isArray(quizData.tags) ? quizData.tags.join(", ") : "",
          imageUrl: quizData.imageUrl || "",
          price: typeof quizData.price === "number" ? quizData.price : 0,
          field: quizData.field || "",
          subject: quizData.subject || "",
          durationInSeconds:
            typeof quizData.durationInSeconds === "number"
              ? quizData.durationInSeconds
              : 0,
          isLocked: !!quizData.isLocked,
          lockPassword: quizData.lockPassword || "",
          difficultyLevel: quizData.difficultyLevel || "",
          durationUnit:
            typeof quizData.durationInSeconds === "number" &&
            quizData.durationInSeconds % 60 === 0
              ? "minutes"
              : "seconds",
        };
      } else {
        return prev;
      }
    });
  }, [quizData]);

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        className="bg-white/95 dark:bg-slate-800/95 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 sm:p-8 flex flex-col h-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Finalize Your Quiz
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors text-2xl"
            >
              &times;
            </button>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 w-full h-full">
            {/* Left: Main Info */}
            <div className="flex-1 min-w-[280px] flex flex-col gap-8">
              <div className="bg-gray-50 dark:bg-slate-900/80 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-md flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  Quiz Details
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                      htmlFor="title"
                    >
                      <FiFileText className="inline mr-2" />
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter quiz title..."
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows={2}
                      placeholder="Describe your quiz..."
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <label
                        className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                        htmlFor="field"
                      >
                        <FiFolder className="inline mr-2" />
                        Field *
                      </label>
                      <input
                        id="field"
                        type="text"
                        value={fieldSearch}
                        onChange={(e) => {
                          setFieldSearch(e.target.value);
                          setShowFieldDropdown(true);
                        }}
                        onFocus={() => setShowFieldDropdown(true)}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Search or enter field..."
                      />
                      {showFieldDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredFields.length > 0 ? (
                            filteredFields.map((field) => (
                              <div
                                key={field}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-gray-900 dark:text-white"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    field,
                                    subject: "",
                                  });
                                  setFieldSearch(field);
                                  setShowFieldDropdown(false);
                                }}
                              >
                                {field}
                              </div>
                            ))
                          ) : (
                            <div
                              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-gray-900 dark:text-white"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  field: fieldSearch,
                                  subject: "",
                                });
                                setShowFieldDropdown(false);
                              }}
                            >
                              Add &quot;{fieldSearch}&quot; as new field
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <label
                        className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                        htmlFor="subject"
                      >
                        <FiTag className="inline mr-2" />
                        Subject *
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={subjectSearch}
                        onChange={(e) => {
                          setSubjectSearch(e.target.value);
                          setShowSubjectDropdown(true);
                        }}
                        onFocus={() => setShowSubjectDropdown(true)}
                        disabled={!formData.field}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder={
                          formData.field
                            ? "Search or enter subject..."
                            : "Select a field first"
                        }
                      />
                      {showSubjectDropdown && formData.field && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredSubjects.length > 0 ? (
                            filteredSubjects.map((subject) => (
                              <div
                                key={subject}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-gray-900 dark:text-white"
                                onClick={() => {
                                  setFormData({ ...formData, subject });
                                  setSubjectSearch(subject);
                                  setShowSubjectDropdown(false);
                                }}
                              >
                                {subject}
                              </div>
                            ))
                          ) : (
                            <div
                              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer text-gray-900 dark:text-white"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  subject: subjectSearch,
                                });
                                setShowSubjectDropdown(false);
                              }}
                            >
                              Add &quot;{subjectSearch}&quot; as new subject
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                      htmlFor="tags"
                    >
                      Tags (comma-separated)
                    </label>
                    <input
                      id="tags"
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., javascript, webdev"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
                      htmlFor="imageUrl"
                    >
                      <FiImage className="inline mr-2" />
                      Cover Image URL
                    </label>
                    <input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      <FiDollarSign className="inline mr-2" />
                      Price
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={formData.price === 0}
                          onChange={() =>
                            setFormData({ ...formData, price: 0 })
                          }
                          className="form-radio h-4 w-4 text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500"
                        />
                        <span>Free</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={formData.price > 0}
                          onChange={() =>
                            setFormData({ ...formData, price: 5 })
                          }
                          className="form-radio h-4 w-4 text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500"
                        />
                        <span>Paid</span>
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        className="w-24 bg-slate-800 border-slate-700 rounded-md px-3 py-2 [appearance:textfield] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Advanced Options */}
            <div className="flex-1 min-w-[280px] flex flex-col gap-8 mt-8 lg:mt-0">
              <div className="bg-gray-50 dark:bg-slate-900/80 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-md flex flex-col gap-6 h-full">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  Advanced Options
                </h3>
                <div className="flex flex-col gap-6">
                  {/* Time Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      ⏱️ Time Limit (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={180}
                        value={
                          formData.durationInSeconds
                            ? formData.durationUnit === "minutes"
                              ? Math.floor(formData.durationInSeconds / 60)
                              : formData.durationInSeconds
                            : ""
                        }
                        onChange={(e) => handleDurationChange(e.target.value)}
                        className="w-24 bg-slate-800 border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="e.g. 2"
                        disabled={
                          formData.durationUnit === "minutes" ? false : false
                        }
                      />
                      <select
                        value={formData.durationUnit}
                        onChange={(e) =>
                          handleDurationUnitChange(e.target.value)
                        }
                        className="bg-slate-800 border-slate-700 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="seconds">Seconds</option>
                      </select>
                      {durationError && (
                        <span className="text-red-400 text-xs ml-2">
                          {durationError}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Leave 0 for unlimited time. Range: 30s to 180min.
                    </p>
                  </div>
                  {/* Lock/Unlock Quiz */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      🔒 Lock Quiz
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">No</span>
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                          formData.isLocked ? "bg-purple-600" : "bg-slate-700"
                        }`}
                        onClick={handleLockToggle}
                        aria-pressed={formData.isLocked}
                      >
                        <span
                          className={`block w-6 h-6 rounded-full bg-white shadow transform transition-transform duration-300 ${
                            formData.isLocked ? "translate-x-6" : ""
                          }`}
                        ></span>
                      </button>
                      <span className="text-slate-400">Yes</span>
                    </div>
                    {/* Animated password field */}
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        formData.isLocked ? "max-h-40 mt-3" : "max-h-0"
                      }`}
                    >
                      {formData.isLocked && (
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1 mt-2">
                            Set Access Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswordValue ? "text" : "password"}
                              value={formData.lockPassword}
                              onChange={(e) =>
                                setFormData((f) => ({
                                  ...f,
                                  lockPassword: e.target.value,
                                }))
                              }
                              className="w-full bg-slate-800 border-slate-700 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                              placeholder="Enter password (min 4 chars)"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                              tabIndex={-1}
                              onClick={() => setShowPasswordValue((v) => !v)}
                              aria-label={
                                showPasswordValue
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showPasswordValue ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwordError && (
                            <span className="text-red-400 text-xs ml-2">
                              {passwordError}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Difficulty Level */}
                  <div className="relative" ref={difficultyDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      🎯 Difficulty Level
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          difficultySearch ||
                          DIFFICULTY_LEVELS.find(
                            (d) => d.value === formData.difficultyLevel
                          )?.label ||
                          ""
                        }
                        onChange={(e) => {
                          setDifficultySearch(e.target.value);
                          setShowDifficultyDropdown(true);
                        }}
                        onFocus={() => setShowDifficultyDropdown(true)}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Search or select difficulty..."
                        readOnly={false}
                      />
                      {showDifficultyDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredDifficulties.length > 0 ? (
                            filteredDifficulties.map((d) => (
                              <div
                                key={d.value}
                                className={`px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2 text-gray-900 dark:text-white`}
                                onClick={() => {
                                  setFormData((f) => ({
                                    ...f,
                                    difficultyLevel: d.value,
                                  }));
                                  setDifficultySearch(d.label);
                                  setShowDifficultyDropdown(false);
                                }}
                              >
                                <span
                                  className={`inline-block w-3 h-3 rounded-full ${d.color}`}
                                ></span>
                                <span className="font-medium">{d.label}</span>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 dark:text-slate-400">
                              No match
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {formData.difficultyLevel && (
                      <span
                        className={`inline-flex items-center gap-2 mt-2 px-2 py-1 rounded text-xs font-semibold ${
                          DIFFICULTY_LEVELS.find(
                            (d) => d.value === formData.difficultyLevel
                          )?.color || "bg-slate-700"
                        } text-white`}
                      >
                        {
                          DIFFICULTY_LEVELS.find(
                            (d) => d.value === formData.difficultyLevel
                          )?.label
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4 w-full">
            <button onClick={onClose} className="futuristic-button-secondary">
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              className="futuristic-button-secondary"
            >
              <FiSave className="inline mr-2" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              className="futuristic-button-primary"
            >
              <FiCheck className="inline mr-2" />
              Save & Publish
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ImportModal({
  onImport,
  onClose,
}: {
  onImport: (file: File) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  // Sample JSON demonstrating all supported question types
  const sample = {
    questions: [
      {
        id: "sample-q1",
        type: "mcq-single",
        question: "What is the powerhouse of the cell?",
        options: [
          { id: "sample-q1-opt1", text: "Nucleus" },
          { id: "sample-q1-opt2", text: "Ribosome" },
          { id: "sample-q1-opt3", text: "Mitochondrion" },
        ],
        correctAnswer: "sample-q1-opt3",
        explanation:
          "The mitochondrion is responsible for generating most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy.",
        marks: 10,
      },
      {
        id: "sample-q2",
        type: "mcq-multiple",
        question: "Which of the following are oceans?",
        options: [
          { id: "sample-q2-opt1", text: "Atlantic" },
          { id: "sample-q2-opt2", text: "Mediterranean" },
          { id: "sample-q2-opt3", text: "Indian" },
          { id: "sample-q2-opt4", text: "Pacific" },
        ],
        correctAnswer: ["sample-q2-opt1", "sample-q2-opt3", "sample-q2-opt4"],
        explanation: "The Mediterranean is a sea, not an ocean.",
        marks: 15,
      },
      {
        id: "sample-q3",
        type: "true-false",
        question: "The Earth is flat.",
        correctAnswer: false,
        explanation: "The Earth is an oblate spheroid.",
        marks: 5,
      },
      {
        id: "sample-q4",
        type: "fill-blanks",
        question: "To be or not to be, that is the ___.",
        fillBlanksAnswers: ["question"],
        marks: 10,
      },
      {
        id: "sample-q5",
        type: "ordering",
        question: "Arrange these numbers in ascending order.",
        orderedItems: ["1", "2", "3", "4", "5"],
        marks: 10,
      },
      {
        id: "sample-q6",
        type: "code-output",
        question: "What is the output of this Python code?",
        codeSnippet: "print('Hello, ' + 'World!')",
        correctAnswer: "Hello, World!",
        explanation: "The '+' operator concatenates strings in Python.",
        marks: 10,
      },
      {
        id: "sample-q7",
        type: "matrix",
        question: "Match the framework to its primary language.",
        matrixOptions: {
          rows: [
            { id: "sample-q7-r1", text: "React" },
            { id: "sample-q7-r2", text: "Django" },
            { id: "sample-q7-r3", text: "Ruby on Rails" },
          ],
          cols: [
            { id: "sample-q7-c1", text: "Python" },
            { id: "sample-q7-c2", text: "Ruby" },
            { id: "sample-q7-c3", text: "JavaScript" },
          ],
        },
        correctAnswer: {
          "sample-q7-r1": "sample-q7-c3",
          "sample-q7-r2": "sample-q7-c1",
          "sample-q7-r3": "sample-q7-c2",
        },
        marks: 20,
      },
      {
        id: "sample-q8",
        type: "drag-drop",
        question: "Categorize the following programming languages.",
        draggableItems: [
          { id: "sample-q8-i1", text: "HTML" },
          { id: "sample-q8-i2", text: "Python" },
          { id: "sample-q8-i3", text: "CSS" },
        ],
        dropZones: [
          { id: "sample-q8-z1", text: "Scripting Language" },
          { id: "sample-q8-z2", text: "Markup/Styling" },
        ],
        correctMapping: {
          "sample-q8-i1": "sample-q8-z2",
          "sample-q8-i2": "sample-q8-z1",
          "sample-q8-i3": "sample-q8-z2",
        },
        marks: 15,
      },
      {
        id: "sample-q9",
        type: "image-based",
        question: "What is depicted in this image?",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Pyramids_of_the_Giza_Necropolis.jpg/1200px-Pyramids_of_the_Giza_Necropolis.jpg",
        correctAnswer: "Pyramids of Giza",
        marks: 10,
      },
      {
        id: "sample-q10",
        type: "paragraph",
        question:
          "Explain the importance of version control in software development.",
        marks: 15,
      },
    ],
  };

  const downloadSample = () => {
    const dataStr = JSON.stringify(sample, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-quiz.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md border border-gray-200/50 dark:border-white/20 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">📥</div>
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Import Quiz
          </h3>
          <p className="text-gray-600 dark:text-white/60 mb-6">
            Upload a JSON file to import your quiz
          </p>
          <input
            type="file"
            accept=".json"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg bg-gray-50 dark:bg-white/5 hover:border-gray-400 dark:hover:border-white/40 transition-all duration-300"
          />
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 text-gray-700 dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => file && onImport(file)}
              disabled={!file}
              className="px-6 py-2 bg-linear-to-r from-purple-500 to-blue-500 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              Import
            </button>
            <button
              onClick={downloadSample}
              className="px-6 py-2 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-white"
            >
              Download Sample JSON
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Marks Management Modal
function MarksModal({
  quizData,
  onUpdate,
  onClose,
}: {
  quizData: QuizData;
  onUpdate: (equalMarks: boolean, marksPerQuestion?: number) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    equalMarks: quizData.equalMarks ?? true,
    marksPerQuestion: quizData.marksPerQuestion || 10,
    totalMarks: quizData.totalMarks || 100,
  });

  const totalMarks = quizData.questions.reduce(
    (sum, q) => sum + (q.marks || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-2xl border border-gray-200/50 dark:border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Marks Management
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-white transition-colors"
          >
            <FiX />
          </button>
        </div>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-white">
                Current Total Marks:
              </span>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {totalMarks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-white">
                Questions:
              </span>
              <span className="text-sm text-gray-600 dark:text-white/60">
                {quizData.questions.length}
              </span>
            </div>
          </div>

          {/* Marks Distribution */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-white">
              Marks Distribution
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.equalMarks}
                  onChange={() =>
                    setFormData({ ...formData, equalMarks: true })
                  }
                  className="text-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Equal Marks for All Questions
                  </span>
                  <p className="text-xs text-gray-600 dark:text-white/60">
                    All questions will have the same marks
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.equalMarks}
                  onChange={() =>
                    setFormData({ ...formData, equalMarks: false })
                  }
                  className="text-purple-500"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Custom Marks per Question
                  </span>
                  <p className="text-xs text-gray-600 dark:text-white/60">
                    Set different marks for each question individually
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Marks Per Question */}
          {formData.equalMarks && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
                Marks per Question
              </label>
              <input
                type="number"
                value={formData.marksPerQuestion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marksPerQuestion: parseInt(e.target.value) || 0,
                  })
                }
                className="w-32 p-3 bg-white dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 focus:border-purple-400 focus:outline-none text-gray-900 dark:text-white"
                min="1"
              />
              <p className="text-xs text-gray-600 dark:text-white/60 mt-1">
                Total: {formData.marksPerQuestion * quizData.questions.length}{" "}
                marks
              </p>
            </div>
          )}

          {/* Question List with Marks */}
          {!formData.equalMarks && (
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-white">
                Question Marks
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {quizData.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-white/5 rounded"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">
                      Q{index + 1}: {question.question.substring(0, 30)}...
                    </span>
                    <input
                      type="number"
                      value={question.marks || 0}
                      onChange={(e) => {
                        const newQuestions = [...quizData.questions];
                        newQuestions[index] = {
                          ...question,
                          marks: parseInt(e.target.value) || 0,
                        };
                        // Update the question in quizData
                        // This would need to be handled through a callback
                      }}
                      className="w-20 p-1 bg-white/10 rounded border border-white/20 focus:border-purple-400 focus:outline-none text-sm"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate(
                formData.equalMarks,
                formData.equalMarks ? formData.marksPerQuestion : undefined
              );
              onClose();
            }}
            className="px-6 py-2 bg-linear-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
          >
            Apply Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Add this component before CreateQuizPageComponent
function QuestionPreview({ question }: { question: Question }) {
  if (!question) return <div>No question selected.</div>;
  switch (question.type) {
    case "mcq-single":
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Options:</h4>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer"
              >
                <input type="radio" name="mcq-single-preview" disabled />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "mcq-multiple":
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Options:</h4>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer"
              >
                <input type="checkbox" disabled />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "true-false":
      return (
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="tf-preview" disabled /> True
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="tf-preview" disabled /> False
          </label>
        </div>
      );
    case "match":
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Match the Following:</h4>
          <div className="grid grid-cols-2 gap-2">
            {question.matchPairs?.map((pair) => (
              <div key={pair.id} className="flex gap-2 items-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {pair.premise}
                </span>
                <span className="text-gray-500">↔</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {pair.response}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "matrix":
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Matrix:</h4>
          <table className="min-w-max border border-white/10 rounded">
            <thead>
              <tr>
                <th className="border px-2 py-1"></th>
                {question.matrixOptions?.cols.map((col) => (
                  <th key={col.id} className="border px-2 py-1">
                    {col.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.matrixOptions?.rows.map((row) => (
                <tr key={row.id}>
                  <td className="border px-2 py-1 font-semibold">{row.text}</td>
                  {question.matrixOptions?.cols.map((col) => (
                    <td key={col.id} className="border px-2 py-1 text-center">
                      <input type="checkbox" disabled />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "poll":
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Poll Options:</h4>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer"
              >
                <input type="radio" name="poll-preview" disabled />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "paragraph":
      return (
        <div>
          <textarea
            className="w-full p-2 rounded border border-white/10"
            rows={4}
            disabled
            placeholder="User will write a paragraph here..."
          />
        </div>
      );
    case "essay":
      return (
        <div>
          <textarea
            className="w-full p-2 rounded border border-white/10"
            rows={8}
            disabled
            placeholder="User will write an essay here..."
          />
          {typeof question.correctAnswer === "number" ||
          typeof question.correctAnswer === "string" ? (
            <div className="mt-2 text-xs text-gray-400">
              Word limit: {String(question.correctAnswer)}
            </div>
          ) : null}
        </div>
      );
    case "fill-blanks": {
      const parts = question.question.split("___");
      return (
        <div className="flex flex-wrap items-center gap-2">
          {parts.map((part, idx) => (
            <React.Fragment key={idx}>
              <span>{part}</span>
              {idx < parts.length - 1 && (
                <input
                  type="text"
                  className="w-24 p-1 rounded border border-white/10"
                  disabled
                  placeholder="Blank"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    case "code-output":
      return (
        <div>
          <pre className="bg-black/80 text-green-200 rounded p-3 mb-2 overflow-x-auto">
            <code>{question.codeSnippet}</code>
          </pre>
          <div className="mt-2">
            <label className="block text-xs font-medium mb-1">
              Expected Output:
            </label>
            <pre className="bg-gray-900 text-yellow-200 rounded p-2 overflow-x-auto">
              <code>
                {typeof question.correctAnswer === "string"
                  ? question.correctAnswer
                  : JSON.stringify(question.correctAnswer)}
              </code>
            </pre>
          </div>
        </div>
      );
    case "drag-drop":
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Drag & Drop:</h4>
          <div className="flex gap-4">
            <div>
              <div className="font-semibold mb-1">Draggable Items</div>
              <ul>
                {question.draggableItems?.map((item) => (
                  <li
                    key={item.id}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1">Drop Zones</div>
              <ul>
                {question.dropZones?.map((zone) => (
                  <li
                    key={zone.id}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded mb-1"
                  >
                    {zone.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    case "ordering":
      return (
        <div>
          <h4 className="text-lg font-semibold mb-2">Ordering:</h4>
          <ol className="list-decimal ml-6">
            {question.orderedItems?.map((item, idx) => (
              <li key={idx} className="bg-white/10 rounded px-2 py-1 mb-1">
                {item}
              </li>
            ))}
          </ol>
        </div>
      );
    case "image-based":
      return (
        <div>
          {question.imageUrl && (
            <div className="relative max-h-48 w-full rounded mb-2 overflow-hidden">
              <Image
                src={question.imageUrl}
                alt="Question"
                width={400}
                height={192}
                className="rounded object-contain"
              />
            </div>
          )}
        </div>
      );
    case "audio":
      return (
        <div>
          {question.audioUrl ? (
            <audio src={question.audioUrl} controls className="w-full mb-2" />
          ) : (
            <div className="p-4 bg-blue-100 text-blue-800 rounded mb-2 text-center">
              Student will upload or record their answer here.
            </div>
          )}
        </div>
      );
    case "video":
      return (
        <div>
          {question.videoUrl ? (
            <video
              src={question.videoUrl}
              controls
              className="max-h-48 rounded mb-2"
            />
          ) : (
            <div className="p-4 bg-blue-100 text-blue-800 rounded mb-2 text-center">
              Student will upload or record their answer here.
            </div>
          )}
        </div>
      );
    default:
      return <div>Preview not available for this question type.</div>;
  }
}

const fixDuplicateQuestionIds = (questions: Question[]): Question[] => {
  const seen = new Set<string>();
  return questions.map((q) => {
    if (seen.has(q.id)) {
      // Assign a new unique ID
      return { ...q, id: nanoid() };
    } else {
      seen.add(q.id);
      return q;
    }
  });
};

export default CreateQuizPageComponent;

