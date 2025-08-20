import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { QuizSelector } from './components/QuizSelector';
import { QuizPage } from './components/QuizPage';
import { ResultsPage } from './components/ResultsPage';
import { CheatAlert } from './components/CheatAlert';
import { AdminRoute } from './components/AdminRoute';
import { Question, QuizSubmission, QuizResult, CheatReport } from './types/quiz';
import { api } from './services/api';

type AppState = 'login' | 'quiz-select' | 'quiz' | 'results' | 'cheat-detected' | 'admin';

function App() {
  const [state, setState] = useState<AppState>('login');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [cheatMethod, setCheatMethod] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if current path is admin
  useEffect(() => {
    if (window.location.pathname === '/admin/logs') {
      setState('admin');
    }
  }, []);

  const handleLogin = async (userName: string, userRollNumber: string) => {
    setName(userName);
    setRollNumber(userRollNumber);
    setState('quiz-select');
  };

  const handleQuizSelect = async (quizId: string) => {
    setSelectedQuizId(quizId);
    setLoading(true);
    setError('');

    try {
      const fetchedQuestions = await api.fetchQuestions(quizId);
      setQuestions(fetchedQuestions);
      setState('quiz');
    } catch (err) {
      setError('Failed to fetch questions. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (submission: QuizSubmission) => {
    setLoading(true);
    try {
      const quizResult = await api.submitQuiz(submission);
      setResult(quizResult);
      setState('results');
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheatDetected = async (method: string) => {
    setCheatMethod(method);
    
    try {
      const ip = await api.getUserIP();
      const cheatReport: CheatReport = {
        name,
        rollNumber,
        ip,
        cheatMethod: method,
        timestamp: new Date().toISOString()
      };
      
      await api.reportCheat(cheatReport);
    } catch (err) {
      console.error('Failed to report cheat:', err);
    }
    
    setState('cheat-detected');
  };

  const handleRestart = () => {
    setState('login');
    setName('');
    setRollNumber('');
    setSelectedQuizId('');
    setQuestions([]);
    setResult(null);
    setCheatMethod('');
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRestart}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {state === 'admin' && <AdminRoute />}
      
      {state === 'login' && <LoginForm onSubmit={handleLogin} />}
      
      {state === 'quiz-select' && (
        <QuizSelector
          name={name}
          rollNumber={rollNumber}
          onQuizSelect={handleQuizSelect}
        />
      )}
      
      {state === 'quiz' && (
        <QuizPage
          name={name}
          rollNumber={rollNumber}
          selectedQuizId={selectedQuizId}
          questions={questions}
          onSubmit={handleQuizSubmit}
          onCheatDetected={handleCheatDetected}
        />
      )}
      
      {state === 'results' && result && (
        <ResultsPage result={result} onRestart={handleRestart} />
      )}
      
      {state === 'cheat-detected' && (
        <CheatAlert cheatMethod={cheatMethod} onRestart={handleRestart} />
      )}
    </>
  );
}

export default App;