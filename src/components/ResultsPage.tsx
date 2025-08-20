import React from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { QuizResult } from '../types/quiz';

interface ResultsPageProps {
  result: QuizResult;
  onRestart: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ result, onRestart }) => {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  const getScoreColor = (score: number, total: number) => {
    const percent = (score / total) * 100;
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number, total: number) => {
    const percent = (score / total) * 100;
    if (percent >= 80) return 'bg-green-50 border-green-200';
    if (percent >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBgColor(result.score, result.totalQuestions)}`}>
                <Trophy className={`w-10 h-10 ${getScoreColor(result.score, result.totalQuestions)}`} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600 mb-4">{result.name} - {result.rollNumber}</p>
            <div className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${getScoreBgColor(result.score, result.totalQuestions)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(result.score, result.totalQuestions)}`}>
                {result.score}/{result.totalQuestions} ({percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Detailed Results</h2>
          
          {result.questions.map((question, index) => {
            const userAnswer = result.userAnswers[question.id];
            const isCorrect = userAnswer === question.answer;
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-2">
                      Question {index + 1}
                    </h3>
                    <p className="text-gray-700 mb-4">{question.question}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {userAnswer || 'Not answered'}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                          <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                            {question.answer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onRestart}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Take Another Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};