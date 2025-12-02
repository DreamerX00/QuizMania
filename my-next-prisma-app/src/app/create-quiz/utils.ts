import { Question, QUESTION_TYPE_IDS } from "./types";
import { toast } from "react-hot-toast";

export const validateQuestion = (
  question: Partial<Question>
): string | null => {
  if (!question.text?.trim()) return "Question text is required";
  if (!question.type) return "Question type is required";
  if (!QUESTION_TYPE_IDS.includes(question.type))
    return "Invalid question type";

  // Type-specific validation
  switch (question.type) {
    case "mcq-single":
    case "mcq-multiple":
      if (!question.options || question.options.length < 2)
        return "At least 2 options required";
      if (
        question.type === "mcq-single" &&
        !question.options.some((o) => o.isCorrect)
      )
        return "One option must be marked as correct";
      if (
        question.type === "mcq-multiple" &&
        !question.options.some((o) => o.isCorrect)
      )
        return "At least one option must be marked as correct";
      break;

    case "true-false":
      if (!question.correctAnswer) return "Correct answer must be selected";
      break;

    case "match":
      if (!question.matchPairs || question.matchPairs.length < 2)
        return "At least 2 match pairs required";
      for (const pair of question.matchPairs) {
        if (!pair.left?.trim() || !pair.right?.trim())
          return "All match pairs must have values";
      }
      break;

    case "matrix":
      if (
        !question.matrixOptions?.rows ||
        question.matrixOptions.rows.length < 2
      )
        return "At least 2 rows required";
      if (
        !question.matrixOptions?.columns ||
        question.matrixOptions.columns.length < 2
      )
        return "At least 2 columns required";
      break;

    case "fill-blanks":
      if (!question.text.includes("___")) return "Use ___ to mark blank spaces";
      if (
        !question.fillBlanksAnswers ||
        question.fillBlanksAnswers.length === 0
      )
        return "Provide answers for blanks";
      break;

    case "code-output":
      if (!question.text?.trim()) return "Code snippet is required";
      if (!question.codeOutput?.trim()) return "Expected output is required";
      break;

    case "ordering":
      if (!question.orderedItems || question.orderedItems.length < 2)
        return "At least 2 items required for ordering";
      break;

    case "drag-drop":
      if (!question.dropZones || question.dropZones.length < 2)
        return "At least 2 drop zones required";
      if (!question.items || question.items.length < 2)
        return "At least 2 draggable items required";
      break;
  }

  return null;
};

export const validateQuizData = (
  formData: {
    title?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    difficultyLevel?: string;
    [key: string]: unknown;
  },
  questions: Question[]
): string | null => {
  if (!formData.title?.trim()) return "Quiz title is required";
  if (!formData.description?.trim()) return "Description is required";
  if (!formData.category) return "Category is required";
  if (!formData.subcategory) return "Subcategory is required";
  if (!formData.difficultyLevel) return "Difficulty level is required";
  if (questions.length === 0) return "At least one question is required";

  // Validate all questions
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (!question) continue;
    const error = validateQuestion(question);
    if (error) return `Question ${i + 1}: ${error}`;
  }

  return null;
};

export const fixDuplicateQuestionIds = (questions: Question[]): Question[] => {
  const seenIds = new Set<string>();
  return questions.map((q) => {
    if (seenIds.has(q.id)) {
      const newId = `${q.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      seenIds.add(newId);
      return { ...q, id: newId };
    }
    seenIds.add(q.id);
    return q;
  });
};

export const calculateTotalPoints = (questions: Question[]): number => {
  return questions.reduce((sum, q) => sum + (q.points || 0), 0);
};

export const calculateEstimatedTime = (questions: Question[]): number => {
  return questions.reduce((sum, q) => sum + (q.timeLimit || 60), 0);
};

export const exportQuiz = (
  formData: { title?: string; [key: string]: unknown },
  questions: Question[]
) => {
  const quizJson = {
    ...formData,
    questions: questions,
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };
  const dataStr = JSON.stringify(quizJson, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
  const exportFileDefaultName = `${formData.title || "quiz"}.json`;
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
  toast.success("Quiz exported successfully!");
};
