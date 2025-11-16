
// src/components/SummaryComponent/InstitutePoints.js
import React from 'react';

const InstitutePoints = ({ totalPoints, spentPoints }) => {
  const availablePoints = totalPoints - spentPoints;

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg shadow-sm border border-green-200 mb-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-green-700 mb-2">Available Points</h3>
        <p className="text-3xl font-bold text-green-800">{availablePoints.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mt-1">Points ready to use</p>
      </div>
    </div>
  );
};

export default InstitutePoints;