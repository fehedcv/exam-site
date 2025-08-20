import React, { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { QuizManager } from './QuizManager';

type AdminView = 'dashboard' | 'quizzes';

export const AdminRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const handleLogin = (username: string, password: string): boolean => {
    // Simple authentication - in production, this should be more secure
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (currentView === 'quizzes') {
    return <QuizManager onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <AdminDashboard 
      onLogout={handleLogout} 
      onManageQuizzes={() => setCurrentView('quizzes')} 
    />
  );
};