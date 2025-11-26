// frontend\src\pages\Dashboard.jsx

import React, { useState, useEffect } from 'react';
import PieChartComponent from '../components/SummaryComponent/PieChartComponent';
import SummarySection from '../components/SummaryComponent/SummarySection';
import InstitutePoints from '../components/SummaryComponent/InstitutePoints';

const Dashboard = () => {
  const [paymentData, setPaymentData] = useState({
    paid: 0,
    pending: 0,
    waiting: 0
  });
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    spentPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both payment data and points data in parallel
        const [paymentResponse, pointsResponse] = await Promise.all([
          fetch('https://www.shorthandexam.in/student-payments-status', {
            credentials: 'include'
          }),
          fetch('https://www.shorthandexam.in/institute-points', {
            credentials: 'include'
          })
        ]);

        if (!paymentResponse.ok) throw new Error('Failed to fetch payment data');
        if (!pointsResponse.ok) throw new Error('Failed to fetch points data');

        const paymentResult = await paymentResponse.json();
        const pointsResult = await pointsResponse.json();
        console.log('Payment Data:', paymentResult);

        if (!paymentResult.success) throw new Error(paymentResult.message);
        if (!pointsResult.success) throw new Error(pointsResult.message);

        // Update payment data
        setPaymentData({
          paid: Number(paymentResult.data.paid),
          pending: Number(paymentResult.data.pending),
          waiting: Number(paymentResult.data.waiting)
        });

        // Update points data
        setPointsData({
          totalPoints: Number(pointsResult.data.totalPoints),
          spentPoints: Number(pointsResult.data.spentPoints)
        });

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  const calculatePercentage = (value) => {
    const total = paymentData.paid + paymentData.pending + paymentData.waiting;
    return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%';
  };

  // Function to handle when points are spent
  const handleSpendPoints = (pointsToSpend) => {
    setPointsData(prev => ({
      ...prev,
      spentPoints: prev.spentPoints + pointsToSpend
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6 md:py-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Student Payment Status
            </h1>
          </div>

          {/* Institute Points Component - Shows only Available Points */}
          <InstitutePoints 
            totalPoints={pointsData.totalPoints} 
            spentPoints={pointsData.spentPoints} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6">
            <PieChartComponent 
              data={paymentData}
              activeIndex={activeIndex}
              onPieEnter={handlePieEnter}
              onPieLeave={handlePieLeave}
              getPercentage={calculatePercentage}
            />
            
            <SummarySection 
              data={{
                ...paymentData,
                total: paymentData.paid + paymentData.pending + paymentData.waiting
              }}
              getPercentage={calculatePercentage}
              onPaymentSuccess={handleSpendPoints}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;