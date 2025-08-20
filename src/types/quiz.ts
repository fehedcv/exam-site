export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export interface QuizSubmission {
  name: string;
  rollNumber: string;
  quizId: string;
  answers: Record<number, string>;
}

export interface QuizResult {
  name: string;
  rollNumber: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: Record<number, string>;
}

export interface CheatReport {
  name: string;
  rollNumber: string;
  ip?: string;
  cheatMethod: string;
  timestamp: string;
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  createdAt: string;
  isActive: boolean;
}

export interface CreateQuizRequest {
  name: string;
  description: string;
  questions: Omit<Question, 'id'>[];
}