import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, ArrowRight } from 'lucide-react';
import { Quiz } from '../types/quiz';
import { api } from '../services/api';

interface QuizSelectorProps {
  name: string;
  rollNumber: string;
  onQuizSelect: (quizId: string) => void;
}

export const QuizSelector: React.FC<QuizSelectorProps> = ({ name, rollNumber, onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const fetchedQuizzes = await api.getQuizzes();
        setQuizzes(fetchedQuizzes.filter(quiz => quiz.isActive));
      } catch (err) {
        setError('Failed to fetch available quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Select a Quiz</h1>
          <p className="text-gray-600">Welcome {name} ({rollNumber})</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Active Quizzes</h2>
            <p className="text-gray-500">There are currently no active quizzes available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                onClick={() => onQuizSelect(quiz.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-indigo-600" />
                    <span className="text-sm text-gray-500">
                      {quiz.questions.length} questions
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
                    <span>Start Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};