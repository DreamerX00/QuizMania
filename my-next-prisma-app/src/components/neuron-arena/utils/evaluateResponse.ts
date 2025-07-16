import { Question, UserResponse } from '../types/quiz.types';

export type EvaluationResult =
  | { status: 'correct' | 'incorrect'; explanation?: string }
  | { status: 'manual'; explanation?: string }
  | { status: 'poll' };

export function evaluateResponse(question: Question, response: UserResponse): EvaluationResult {
  if (!response) return { status: 'incorrect' };
  switch (question.type) {
    case 'mcq-single':
    case 'true-false':
      return {
        status:
          JSON.stringify(response.response) === JSON.stringify(question.correctAnswer)
            ? 'correct'
            : 'incorrect',
        explanation: question.explanation,
      };
    case 'mcq-multiple':
      // Compare arrays
      const a = Array.isArray(response.response) ? response.response.sort() : [];
      const b = Array.isArray(question.correctAnswer) ? question.correctAnswer.sort() : [];
      return {
        status: JSON.stringify(a) === JSON.stringify(b) ? 'correct' : 'incorrect',
        explanation: question.explanation,
      };
    case 'fill-blanks':
      // Compare arrays or strings
      if (Array.isArray(question.correctAnswer) && Array.isArray(response.response)) {
        return {
          status: JSON.stringify(response.response) === JSON.stringify(question.correctAnswer)
            ? 'correct'
            : 'incorrect',
          explanation: question.explanation,
        };
      }
      return { status: 'incorrect', explanation: question.explanation };
    case 'ordering':
      // Compare arrays
      return {
        status: JSON.stringify(response.response) === JSON.stringify(question.correctAnswer)
          ? 'correct'
          : 'incorrect',
        explanation: question.explanation,
      };
    case 'code-output':
      // For now, compare output string
      return {
        status: response.response === question.correctAnswer ? 'correct' : 'incorrect',
        explanation: question.explanation,
      };
    case 'image-based':
      // Accept any response for now
      return {
        status: response.response ? 'correct' : 'incorrect',
        explanation: question.explanation,
      };
    case 'matrix':
      // Compare matrix answers
      return {
        status: JSON.stringify(response.response) === JSON.stringify(question.correctAnswer)
          ? 'correct'
          : 'incorrect',
        explanation: question.explanation,
      };
    case 'drag-drop':
      // Compare arrays
      return {
        status: JSON.stringify(response.response) === JSON.stringify(question.correctAnswer)
          ? 'correct'
          : 'incorrect',
        explanation: question.explanation,
      };
    case 'essay':
    case 'paragraph':
    case 'audio':
    case 'video':
      return { status: 'manual', explanation: question.explanation };
    case 'poll':
      return { status: 'poll' };
    default:
      return { status: 'incorrect' };
  }
} 