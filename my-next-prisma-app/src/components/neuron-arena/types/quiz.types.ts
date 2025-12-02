export type QuestionType =
  | "mcq-single"
  | "mcq-multiple"
  | "true-false"
  | "fill-blanks"
  | "ordering"
  | "code-output"
  | "image-based"
  | "matrix"
  | "drag-drop"
  | "essay"
  | "paragraph"
  | "audio"
  | "video"
  | "poll";

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  duration: number; // seconds
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string; // changed from 'text' to 'question' for consistency
  options?: Array<string | { label: string; value: unknown }>; // for MCQ, poll, image-based, etc.
  correctAnswer?: string | number | boolean | string[] | unknown;
  explanation?: string;
  // Advanced fields for specific types
  minWordCount?: number; // essay, paragraph
  maxWordCount?: number; // essay, paragraph
  fileSizeLimitMB?: number; // audio, video
  maxDurationSeconds?: number; // audio, video
  imageUrl?: string; // image-based
  matrixOptions?: { rows: string[]; cols: string[] }; // matrix
  draggableItems?: Array<{ id: string; content: string }>; // drag-drop
  dropZones?: Array<{ id: string; content: string }>; // drag-drop
  fillBlanksAnswers?: string[]; // fill-blanks
  // Add more fields as needed for each type
  [key: string]: unknown;
}

export interface UserResponse {
  questionId: string;
  response: string | number | boolean | string[] | unknown;
  markedForReview?: boolean;
}
