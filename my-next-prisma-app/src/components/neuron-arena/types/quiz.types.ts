export type QuestionType =
  | 'mcq-single'
  | 'mcq-multiple'
  | 'true-false'
  | 'fill-blanks'
  | 'ordering'
  | 'code-output'
  | 'image-based'
  | 'matrix'
  | 'drag-drop'
  | 'essay'
  | 'paragraph'
  | 'audio'
  | 'video'
  | 'poll';

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
  options?: any[]; // for MCQ, poll, image-based, etc.
  correctAnswer?: any;
  explanation?: string;
  // Advanced fields for specific types
  minWordCount?: number; // essay, paragraph
  maxWordCount?: number; // essay, paragraph
  fileSizeLimitMB?: number; // audio, video
  maxDurationSeconds?: number; // audio, video
  imageUrl?: string; // image-based
  matrixOptions?: { rows: any[]; cols: any[] }; // matrix
  draggableItems?: any[]; // drag-drop
  dropZones?: any[]; // drag-drop
  fillBlanksAnswers?: any[]; // fill-blanks
  // Add more fields as needed for each type
  [key: string]: any;
}

export interface UserResponse {
  questionId: string;
  response: any;
  markedForReview?: boolean;
}
