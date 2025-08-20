import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Calendar,
  Trophy,
  Shield,
  LogOut,
  FileText,
  BarChart3,
  Settings,
  BookOpen
} from 'lucide-react';
import { Quiz } from '../types/quiz';
import { api } from '../services/api';

interface QuizResult {
  name: string;
  rollNumber: string;
  quizId?: string;
  quizName?: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  answers: Record<string, string>;
}

interface CheatReport {
  name: string;
  rollNumber: string;
  ip: string;
  cheatMethod: string;
  timestamp: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  onManageQuizzes: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onManageQuizzes }) => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [cheatReports, setCheatReports] = useState<CheatReport[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'results' | 'cheats' | 'quiz-results'>('results');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [resultsResponse, cheatsResponse, quizzesData] = await Promise.all([
        fetch('http://localhost:8000/admin/results'),
        fetch('http://localhost:8000/admin/cheats'),
        api.getQuizzes()
      ]);

      if (!resultsResponse.ok || !cheatsResponse.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const resultsData = await resultsResponse.json();
      const cheatsData = await cheatsResponse.json();

      setResults(resultsData);
      setCheatReports(cheatsData);
      setQuizzes(quizzesData);
    } catch (err) {
      setError('Failed to load admin data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadResults = () => {
    const csvContent = [
      'Name,Roll Number,Score,Total Questions,Percentage,Timestamp',
      ...results.map(r => 
        `"${r.name}","${r.rollNumber}",${r.score},${r.totalQuestions},${Math.round((r.score/r.totalQuestions)*100)}%,"${new Date(r.timestamp).toLocaleString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadCheats = () => {
    const csvContent = [
      'Name,Roll Number,IP,Cheat Method,Timestamp',
      ...cheatReports.map(c => 
        `"${c.name}","${c.rollNumber}","${c.ip}","${c.cheatMethod}","${new Date(c.timestamp).toLocaleString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cheat_reports.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadQuizResults = async (quizId: string, quizName: string) => {
    try {
      const quizResults = await api.getQuizResults(quizId);
      const csvContent = [
        'Name,Roll Number,Score,Total Questions,Percentage,Timestamp',
        ...quizResults.map(r => 
          `"${r.name}","${r.rollNumber}",${r.score},${r.totalQuestions},${Math.round((r.score/r.totalQuestions)*100)}%,"${new Date(r.timestamp).toLocaleString()}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quizName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download quiz results');
    }
  };
  const getStats = () => {
    const totalAttempts = results.length;
    const totalCheats = cheatReports.length;
    const averageScore = results.length > 0 
      ? results.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / results.length * 100
      : 0;
    const passRate = results.filter(r => (r.score / r.totalQuestions) >= 0.6).length / Math.max(results.length, 1) * 100;

    return { totalAttempts, totalCheats, averageScore, passRate };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onManageQuizzes}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Quizzes</span>
            </button>
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cheat Reports</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalCheats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{stats.averageScore.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.passRate.toFixed(1)}%</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Quiz Results ({results.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('cheats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'cheats'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cheat Reports ({cheatReports.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('quiz-results')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'quiz-results'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Quiz Results ({quizzes.length})</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'results' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Quiz Results</h2>
                  <button
                    onClick={downloadResults}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quiz
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{result.name}</div>
                              <div className="text-sm text-gray-500">{result.rollNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {result.quizName || 'Default Quiz'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {result.score}/{result.totalQuestions}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (result.score / result.totalQuestions) >= 0.8
                                ? 'bg-green-100 text-green-800'
                                : (result.score / result.totalQuestions) >= 0.6
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round((result.score / result.totalQuestions) * 100)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'quiz-results' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Individual Quiz Results</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => {
                    const quizResults = results.filter(r => r.quizId === quiz.id);
                    const averageScore = quizResults.length > 0 
                      ? quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / quizResults.length * 100
                      : 0;
                    
                    return (
                      <div key={quiz.id} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                          <BookOpen className="w-8 h-8 text-indigo-600" />
                          <span className="text-sm text-gray-500">
                            {quizResults.length} attempts
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Attempts:</span>
                            <span className="font-medium">{quizResults.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Score:</span>
                            <span className="font-medium">{averageScore.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => downloadQuizResults(quiz.id, quiz.name)}
                          disabled={quizResults.length === 0}
                          className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            quizResults.length > 0
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Results</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                {quizzes.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">No Quizzes Yet</h2>
                    <p className="text-gray-500">Create quizzes to see individual results here.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'cheats' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Cheat Reports</h2>
                  <button
                    onClick={downloadCheats}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cheat Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cheatReports.map((report, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{report.name}</div>
                              <div className="text-sm text-gray-500">{report.rollNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.ip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {report.cheatMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};