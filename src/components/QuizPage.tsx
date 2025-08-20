import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Send } from 'lucide-react';
import { Question, QuizSubmission } from '../types/quiz';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { api } from '../services/api';

interface QuizPageProps {
  name: string;
  rollNumber: string;
  selectedQuizId: string;
  questions: Question[];
  onSubmit: (submission: QuizSubmission) => void;
  onCheatDetected: (method: string) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  name,
  rollNumber,
  selectedQuizId,
  questions,
  onSubmit,
  onCheatDetected
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAntiCheat({
    onCheatDetected,
    enabled: true
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const submission: QuizSubmission = {
      name,
      rollNumber,
      quizId: selectedQuizId,
      answers
    };
    
    onSubmit(submission);
  };

  const allQuestionsAnswered = questions.every(q => answers[q.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Quiz in Progress</h1>
            <p className="text-sm text-gray-600">{name} - {rollNumber}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">
              Anti-cheating is active. Do not switch tabs, minimize window, or exit fullscreen.
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Question {index + 1}
                </h3>
                <p className="text-gray-700">{question.question}</p>
              </div>
              
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              
              </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
              allQuestionsAnswered && !isSubmitting
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        </div>

        {!allQuestionsAnswered && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Please answer all questions before submitting.
          </p>
        )}
      </div>
    </div>
  );
};