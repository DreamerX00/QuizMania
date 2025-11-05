import { useState, useCallback } from "react";
import { Question, QuizData } from "./types";
import { nanoid } from "nanoid";

const initialFormData = {
  title: "",
  description: "",
  difficultyLevel: "",
  estimatedTime: 30,
  passingScore: 60,
  tags: [],
  category: "",
  subcategory: "",
  imageUrl: "",
  isPremium: false,
  price: 0,
  questions: [],
  randomizeQuestions: false,
  randomizeOptions: false,
  showResults: true,
  allowReview: true,
};

export const useQuizForm = (initialQuestions: Question[] = []) => {
  const [formData, setFormData] = useState<any>(initialFormData);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const addQuestion = useCallback((question: Question) => {
    const newQuestion = { ...question, id: nanoid() };
    setQuestions((prev) => [...prev, newQuestion]);
  }, []);

  const updateQuestion = useCallback((index: number, question: Question) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = question;
      return updated;
    });
  }, []);

  const deleteQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const duplicateQuestion = useCallback((index: number) => {
    setQuestions((prev) => {
      const question = prev[index];
      const duplicated = { ...question, id: nanoid() };
      return [
        ...prev.slice(0, index + 1),
        duplicated,
        ...prev.slice(index + 1),
      ];
    });
  }, []);

  const moveQuestion = useCallback((fromIndex: number, toIndex: number) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      const [moved] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, moved);
      return newQuestions;
    });
  }, []);

  const startEditingQuestion = useCallback(
    (question: Question, index: number) => {
      setEditingQuestion(question);
      setEditingIndex(index);
    },
    []
  );

  const cancelEditingQuestion = useCallback(() => {
    setEditingQuestion(null);
    setEditingIndex(-1);
  }, []);

  const saveEditedQuestion = useCallback(
    (question: Question) => {
      if (editingIndex >= 0) {
        updateQuestion(editingIndex, question);
      } else {
        addQuestion(question);
      }
      cancelEditingQuestion();
    },
    [editingIndex, updateQuestion, addQuestion, cancelEditingQuestion]
  );

  const loadQuizData = useCallback((data: any) => {
    setFormData({
      ...initialFormData,
      ...data,
    });
    if (data.questions) {
      setQuestions(data.questions);
    }
  }, []);

  const resetQuiz = useCallback(() => {
    setFormData(initialFormData);
    setQuestions([]);
    setEditingQuestion(null);
    setEditingIndex(-1);
  }, []);

  return {
    formData,
    questions,
    editingQuestion,
    editingIndex,
    updateFormData,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    startEditingQuestion,
    cancelEditingQuestion,
    saveEditedQuestion,
    loadQuizData,
    resetQuiz,
    setQuestions,
  };
};
