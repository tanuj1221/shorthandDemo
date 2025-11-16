// frontend\src\components\SummaryComponent\ResetButtons.jsx

import React from 'react';

const ResetButtons = () => {
  return (
    <div className="space-y-4 mt-4">
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