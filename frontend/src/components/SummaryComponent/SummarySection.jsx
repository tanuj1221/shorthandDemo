import React from 'react';
import PropTypes from 'prop-types';

const SummarySection = ({ 
  data = { total: 0, paid: 0, pending: 0, waiting: 0 },
  title = "Summary",
  getPercentage = (value, total) => (total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%')
}) => {
  // Status configuration for consistent styling
  const statusConfig = [
    { 
      key: 'paid',
      label: 'Paid Students',
      color: '#4DD0E1',
      textColor: 'text-white'
    },
    {
      key: 'pending',
      label: 'Pending Students',
      color: '#FF80AB',
      textColor: 'text-white'
    },
    {
      key: 'waiting',
      label: 'Waiting Students',
      color: '#FFE082',
      textColor: 'text-gray-800'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800">{title}</h2>
      
      <div className="space-y-4">
        {/* Total Students */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <span className="text-gray-700 font-medium">Total Students:</span>
          <span className="text-lg font-bold text-gray-900">{data.total}</span>
        </div>
        
        {/* Dynamic Status Items */}
        {statusConfig.map((status) => (
          <div 
            key={status.key} 
            className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            <span className="text-gray-700 font-medium">{status.label}:</span>
            <div className="flex flex-col items-end">
              <span 
                className={`px-4 py-1 rounded-full font-medium transition-transform duration-200 hover:scale-105 ${status.textColor}`}
                style={{ backgroundColor: status.color }}
              >
                {data[status.key] || 0}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {getPercentage(data[status.key], data.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SummarySection.propTypes = {
  data: PropTypes.shape({
    total: PropTypes.number,
    paid: PropTypes.number,
    pending: PropTypes.number,
    waiting: PropTypes.number
  }),
  title: PropTypes.string,
  getPercentage: PropTypes.func
};

export default SummarySection;