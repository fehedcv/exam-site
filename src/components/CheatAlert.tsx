import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CheatAlertProps {
  cheatMethod: string;
  onRestart: () => void;
}

export const CheatAlert: React.FC<CheatAlertProps> = ({ cheatMethod, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-red-600 mb-4">Cheating Detected!</h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium mb-2">Violation:</p>
            <p className="text-red-700">{cheatMethod}</p>
          </div>
          
          <p className="text-gray-600 mb-6">
            Your attempt has been recorded and reported. The quiz will now restart.
          </p>
          
          <button
            onClick={onRestart}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Restart Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};