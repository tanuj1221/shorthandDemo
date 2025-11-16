import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import PropTypes from 'prop-types';

const PieChartComponent = ({ 
  data = { paid: 0, pending: 0, waiting: 0 },
  activeIndex: externalActiveIndex = null,
  onPieEnter: externalPieEnter = () => {},
  onPieLeave: externalPieLeave = () => {},
  getPercentage = (value, total) => (total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%')
}) => {
  // Internal state for hover control if not controlled externally
  const [internalActiveIndex, setInternalActiveIndex] = useState(null);
  
  const isControlled = externalActiveIndex !== null;
  const activeIndex = isControlled ? externalActiveIndex : internalActiveIndex;

  // Format data for pie chart with minimum value for segments
  const pieData = [
    { name: 'Paid', value: Math.max(data.paid, 0.1), color: '#4DD0E1', actualValue: data.paid },
    { name: 'Pending', value: Math.max(data.pending, 0.1), color: '#FF80AB', actualValue: data.pending },
    { name: 'Waiting', value: Math.max(data.waiting, 0.1), color: '#FFE082', actualValue: data.waiting }
  ];

  const total = data.paid + data.pending + data.waiting;

  const handlePieEnter = (_, index) => {
    if (!isControlled) {
      setInternalActiveIndex(index);
    }
    externalPieEnter(_, index);
  };

  const handlePieLeave = () => {
    if (!isControlled) {
      setInternalActiveIndex(null);
    }
    externalPieLeave();
  };

  // Custom active shape for better hover effect
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const actualValue = payload.actualValue;
    
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#333" fontSize={16} fontWeight="bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontSize={22} fontWeight="bold">
          {actualValue}
        </text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#666" fontSize={14}>
          {`${getPercentage(actualValue, total)}`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={activeIndex !== null ? renderActiveShape : null}
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={handlePieEnter}
              onMouseLeave={handlePieLeave}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${props.payload.actualValue} Students (${getPercentage(props.payload.actualValue, total)})`,
                name
              ]}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-4 space-x-6">
        {pieData.map((entry, index) => (
          <div 
            key={index} 
            className="flex items-center group cursor-pointer"
            onMouseEnter={() => handlePieEnter(null, index)}
            onMouseLeave={handlePieLeave}
          >
            <div 
              className="w-4 h-4 rounded-full mr-2 group-hover:scale-125 transition-transform duration-200" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
              {entry.name} ({entry.actualValue})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

PieChartComponent.propTypes = {
  data: PropTypes.shape({
    paid: PropTypes.number,
    pending: PropTypes.number,
    waiting: PropTypes.number
  }),
  activeIndex: PropTypes.number,
  onPieEnter: PropTypes.func,
  onPieLeave: PropTypes.func,
  getPercentage: PropTypes.func
};

export default PieChartComponent;