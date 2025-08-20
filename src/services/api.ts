import { Question, QuizSubmission, QuizResult, CheatReport } from '../types/quiz';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  async fetchQuestions(quizId?: string): Promise<Question[]> {
    const url = quizId ? `${API_BASE_URL}/questions/${quizId}` : `${API_BASE_URL}/questions`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  },

  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });
    if (!response.ok) {
      throw new Error('Failed to submit quiz');
    }
    return response.json();
  },

  async reportCheat(cheatReport: CheatReport): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/report-cheat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cheatReport),
    });
    if (!response.ok) {
      throw new Error('Failed to report cheat');
    }
  },

  async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  },

  // Admin APIs
  async getQuizzes(): Promise<Quiz[]> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes`);
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    return response.json();
  },

  async createQuiz(quiz: CreateQuizRequest): Promise<Quiz> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quiz),
    });
    if (!response.ok) {
      throw new Error('Failed to create quiz');
    }
    return response.json();
  },

  async deleteQuiz(quizId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes/${quizId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete quiz');
    }
  },

  async toggleQuizStatus(quizId: string): Promise<Quiz> {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes/${quizId}/toggle`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to toggle quiz status');
    }
    return response.json();
  },

  async getQuizResults(quizId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/results/${quizId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch quiz results');
    }
    return response.json();
  }
};