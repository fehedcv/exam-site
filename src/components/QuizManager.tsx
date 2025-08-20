import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { Quiz, CreateQuizRequest } from '../types/quiz';
import { api } from '../services/api';

interface QuizManagerProps {
  onBack: () => void;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ onBack }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');

  const [newQuiz, setNewQuiz] = useState<CreateQuizRequest>({
    name: '',
    description: '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: ''
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const fetchedQuizzes = await api.getQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (err) {
      setError('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!newQuiz.name.trim() || !newQuiz.description.trim() || newQuiz.questions.length === 0) {
      setError('Please fill in all fields and add at least one question');
      return;
    }

    try {
      await api.createQuiz(newQuiz);
      setNewQuiz({ name: '', description: '', questions: [] });
      setCurrentQuestion({ question: '', options: ['', '', '', ''], answer: '' });
      setShowCreateForm(false);
      fetchQuizzes();
      setError('');
    } catch (err) {
      setError('Failed to create quiz');
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim() || 
        currentQuestion.options.some(opt => !opt.trim()) || 
        !currentQuestion.answer.trim()) {
      setError('Please fill in all question fields');
      return;
    }

    if (!currentQuestion.options.includes(currentQuestion.answer)) {
      setError('The answer must be one of the provided options');
      return;
    }

    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({ question: '', options: ['', '', '', ''], answer: '' });
    setError('');
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await api.deleteQuiz(quizId);
      fetchQuizzes();
    } catch (err) {
      setError('Failed to delete quiz');
    }
  };

  const handleToggleStatus = async (quizId: string) => {
    try {
      await api.toggleQuizStatus(quizId);
      fetchQuizzes();
    } catch (err) {
      setError('Failed to toggle quiz status');
    }
  };

  const removeQuestion = (index: number) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
            <p className="text-gray-600">Create and manage quiz questions</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quiz</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Create Quiz Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create New Quiz</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Name</label>
                <input
                  type="text"
                  value={newQuiz.name}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter quiz name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter quiz description"
                />
              </div>
            </div>

            {/* Add Question Form */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Question</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter your question"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {currentQuestion.options.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option {index + 1}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[index] = e.target.value;
                        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`Enter option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                <select
                  value={currentQuestion.answer}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select correct answer</option>
                  {currentQuestion.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option || `Option ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddQuestion}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions List */}
            {newQuiz.questions.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Questions ({newQuiz.questions.length})
                </h3>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {newQuiz.questions.map((q, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-2">{index + 1}. {q.question}</p>
                          <p className="text-sm text-green-600">Answer: {q.answer}</p>
                        </div>
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuiz}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Create Quiz</span>
              </button>
            </div>
          </div>
        )}

        {/* Quizzes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(quiz.id)}
                    className={`p-1 rounded ${quiz.isActive ? 'text-green-600' : 'text-gray-400'}`}
                    title={quiz.isActive ? 'Active' : 'Inactive'}
                  >
                    {quiz.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.name}</h3>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{quiz.questions.length} questions</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No Quizzes Yet</h2>
            <p className="text-gray-500">Create your first quiz to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};