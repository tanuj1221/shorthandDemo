// frontend\src\pages\Summary.jsx
import React, { useState, useEffect } from 'react';
import PieChartComponent from '../components/SummaryComponent/PieChartComponent';
import SummarySection from '../components/SummaryComponent/SummarySection';
import ResetButtons from '../components/SummaryComponent/ResetButtons';

function StudentStatusDashboard({ studentData }) {
  const [data, setData] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    waiting: 0
  });
  const [isAdmin,setIsAdmin] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  // Update data when studentData prop changes
  useEffect(() => {
    if (studentData) {
      setData(studentData);
    }
  }, [studentData]);

  // Sample data only used for preview if no props provided
 useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:3001/student/status-counts'); // Adjust this URL as needed
          if (!response.ok) throw new Error('Failed to fetch data');
          
          const result = await response.json();
  
          const total = result.paid + result.pending + result.waiting;
  
          setData({
            paid: result.paid || 0,
            pending: result.pending || 0,
            waiting: result.waiting || 0,
            total
          });
        } catch (err) {
          console.error('Error fetching student status data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800">
          Student Status Summary
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Chart Section */}
          <PieChartComponent data={data} />
          
          {/* Summary Section and Buttons */}
          <div className="flex flex-col justify-between">
            <SummarySection data={data} />
            {isAdmin && <ResetButtons /> }
          </div>
        </div>
      </div>
    </div>
  );
}  

export default StudentStatusDashboard;

