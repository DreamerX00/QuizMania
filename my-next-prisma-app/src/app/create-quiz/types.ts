// Question Types and Interfaces for Quiz Creation

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface MatrixOptions {
  rows: string[];
  columns: string[];
  correctAnswers: { [key: string]: string };
}

export interface DropZone {
  id: string;
  label: string;
  acceptedItems: string[];
}

export interface Question {
  id: string;
  type: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  options?: Option[];
  correctAnswer?: string | string[];
  matchPairs?: MatchPair[];
  matrixOptions?: MatrixOptions;
  fillBlanksAnswers?: string[];
  codeLanguage?: string;
  codeOutput?: string;
  orderedItems?: string[];
  dropZones?: DropZone[];
  items?: string[];
  points: number;
  timeLimit?: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  answerKey?: string;
  hintsCount?: number;
  showAnswerAfter?: boolean;
}

export interface QuizData {
  title: string;
  description: string;
  difficultyLevel: string;
  estimatedTime: number;
  passingScore: number;
  tags: string[];
  category: string;
  subcategory: string;
  imageUrl: string;
  isPremium: boolean;
  price: number;
  questions: Question[];
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResults: boolean;
  allowReview: boolean;
}

export const QUESTION_TYPES = [
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
    color: "from-teal-500 to-teal-600",
    guide:
      "Students must predict the output of a given code snippet. Ideal for programming courses.",
  },
  {
    id: "ordering",
    name: "Ordering",
    icon: "🔢",
    color: "from-cyan-500 to-cyan-600",
    guide:
      "Students arrange items in the correct order. Useful for sequences, processes, or chronological events.",
  },
  {
    id: "drag-drop",
    name: "Drag & Drop",
    icon: "🎯",
    color: "from-violet-500 to-violet-600",
    guide:
      "Interactive question where students drag items into designated drop zones.",
  },
  {
    id: "image-based",
    name: "Image Based",
    icon: "🖼️",
    color: "from-rose-500 to-rose-600",
    guide:
      "Question based on an image. Students provide answers related to visual content.",
  },
  {
    id: "audio",
    name: "Audio Based",
    icon: "🎵",
    color: "from-amber-500 to-amber-600",
    guide:
      "Question based on an audio clip. Students listen and answer questions about what they heard.",
  },
  {
    id: "video",
    name: "Video Based",
    icon: "🎬",
    color: "from-emerald-500 to-emerald-600",
    guide:
      "Question based on a video. Students watch the video and answer related questions.",
  },
];

export const QUESTION_TYPE_IDS = QUESTION_TYPES.map((q) => q.id);

export const DIFFICULTY_LEVELS = [
  {
    value: "BEGINNER",
    label: "Beginner",
    color: "bg-green-500",
    description: "Basic concepts and fundamentals",
  },
  {
    value: "EASY",
    label: "Easy",
    color: "bg-blue-500",
    description: "Simple application of concepts",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    color: "bg-yellow-500",
    description: "Moderate complexity and understanding",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    color: "bg-orange-500",
    description: "Deep knowledge and complex scenarios",
  },
  {
    value: "EXPERT",
    label: "Expert",
    color: "bg-red-500",
    description: "Mastery level and edge cases",
  },
];

export const academicFields = {
  "Computer Science": [
    "Programming",
    "Data Structures",
    "Algorithms",
    "Web Development",
    "Machine Learning",
    "Databases",
    "Operating Systems",
    "Computer Networks",
    "Cybersecurity",
    "Software Engineering",
  ],
  Mathematics: [
    "Algebra",
    "Geometry",
    "Calculus",
    "Statistics",
    "Trigonometry",
    "Linear Algebra",
    "Discrete Mathematics",
    "Number Theory",
    "Probability",
    "Differential Equations",
  ],
  Science: [
    "Physics",
    "Chemistry",
    "Biology",
    "Astronomy",
    "Environmental Science",
    "Geology",
    "Genetics",
    "Biochemistry",
    "Microbiology",
    "Zoology",
  ],
  "Business & Economics": [
    "Accounting",
    "Finance",
    "Marketing",
    "Management",
    "Economics",
    "Entrepreneurship",
    "Business Strategy",
    "Human Resources",
    "Operations Management",
    "International Business",
  ],
  "Arts & Humanities": [
    "History",
    "Literature",
    "Philosophy",
    "Art History",
    "Music",
    "Cultural Studies",
    "Linguistics",
    "Archaeology",
    "Anthropology",
    "Theater",
  ],
  Engineering: [
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Biomedical Engineering",
    "Industrial Engineering",
    "Environmental Engineering",
    "Materials Science",
    "Robotics",
  ],
  "Health & Medicine": [
    "Anatomy",
    "Physiology",
    "Pharmacology",
    "Nursing",
    "Public Health",
    "Nutrition",
    "Medicine",
    "Dentistry",
    "Psychology",
    "Mental Health",
  ],
  "Social Sciences": [
    "Sociology",
    "Political Science",
    "Geography",
    "Education",
    "Communication",
    "International Relations",
    "Criminology",
    "Social Work",
    "Urban Studies",
    "Gender Studies",
  ],
  Languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Arabic",
    "Hindi",
    "Portuguese",
    "Russian",
  ],
  "General Knowledge": [
    "Current Affairs",
    "World Geography",
    "Sports",
    "Entertainment",
    "Technology",
    "Science & Discovery",
    "Famous Personalities",
    "World History",
    "Trivia",
    "General Awareness",
  ],
};
