// frontend\src\components\SummaryComponent\ResetButtons.jsx

import React, { useState } from 'react';
import axios from 'axios';

const ResetButtons = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleResetTimers = async () => {
    if (!window.confirm('Are you sure you want to reset all student timers? This will update rem_time for all students based on their subject Demo_Timer.')) {
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:3001/reset-timers', {}, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage({
          text: `✓ Success! Updated ${response.data.changedRows} student timers.`,
          type: 'success'
        });
        
        // Clear message after 5 seconds
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      }
    } catch (error) {
      console.error('Timer reset error:', error);
      setMessage({
        text: `✗ Error: ${error.response?.data?.message || 'Failed to reset timers'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Timer Reset Button */}
      <button 
        onClick={handleResetTimers}
        disabled={loading}
        className={`w-full py-3 ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Resetting Timers...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset All Student Timers</span>
          </>
        )}
      </button>

      {/* Status Message */}
      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <p className="font-semibold mb-1">ℹ️ About Timer Reset:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Resets rem_time for all students</li>
          <li>Uses Demo_Timer from their subject</li>
          <li>Runs automatically at midnight daily</li>
          <li>Use this button if auto-reset fails</li>
        </ul>
      </div>

      {/* Original Buttons (if still needed) */}
      <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 transform hover:-translate-y-1">
        <span>Reset Time to 300 min</span>
      </button>
      
      <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 transform hover:-translate-y-1">
        <span>Reset Time to 1440 min</span>
      </button>
    </div>
  );
};

export default ResetButtons;