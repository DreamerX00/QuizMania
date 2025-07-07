export type QuestionType =
  | 'mcq-single'
  | 'mcq-multiple'
  | 'true-false'
  | 'fill-blanks'
  | 'ordering'
  | 'code-output'
  | 'image-based'
  | 'matrix'
  | 'drag-drop';

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
  text: string;
  options?: string[];
  correctAnswer?: any;
  explanation?: string;
  // Add more fields as needed for each type
  [key: string]: any;
}

export interface UserResponse {
  questionId: string;
  response: any;
  markedForReview?: boolean;
}
