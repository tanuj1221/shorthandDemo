// frontend\src\pages\PaidStudent.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaidStudentsTable() {
  const [paidStudents, setPaidStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaidStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://www.shorthandexam.in/paid-students', {
          params: {
            page: currentPage,
            pageSize: pageSize
          },
          withCredentials: true
        });
        
        setPaidStudents(response.data.data);
        setTotalStudents(response.data.totalStudents);
        setError(null);
      } catch (err) {
        console.error('Error fetching paid students:', err);
        setError('Failed to fetch paid students. Please try again later.');
        setPaidStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidStudents();
  }, [currentPage, pageSize]);

  const totalPages = Math.ceil(totalStudents / pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);

  const formatPoints = (points) => {
    if (points === null || points === undefined) return 'N/A';
    return points.toLocaleString();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Paid Students List
          </h1>
          <p className="text-center text-gray-600 text-lg mb-6">
            Total Paid Students: {totalStudents}
          </p>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading paid students...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 border-b text-left">Student ID</th>
                      <th className="py-3 px-4 border-b text-left">Name</th>
                      <th className="py-3 px-4 border-b text-left">Mobile</th>
                      <th className="py-3 px-4 border-b text-left">Email</th>
                      <th className="py-3 px-4 border-b text-left">UTR</th>
                      <th className="py-3 px-4 border-b text-left">Payment Date</th>
                      <th className="py-3 px-4 border-b text-left">Amount</th>
                      <th className="py-3 px-4 border-b text-left">Points</th> {/* NEW COLUMN */}
                    </tr>
                  </thead>
                  <tbody>
                    {paidStudents.length > 0 ? (
                      paidStudents.map((student) => (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 border-b">{student.student_id}</td>
                          <td className="py-3 px-4 border-b">{student.user}</td>
                          <td className="py-3 px-4 border-b">{student.mobile}</td>
                          <td className="py-3 px-4 border-b">{student.email}</td>
                          <td className="py-3 px-4 border-b">{student.utr || 'N/A'}</td>
                          <td className="py-3 px-4 border-b">{formatDate(student.date)}</td>
                          <td className="py-3 px-4 border-b font-semibold text-green-600">
                            {formatCurrency(student.amount)}
                          </td>
                          <td className="py-3 px-4 border-b font-medium text-blue-600">
                            {formatPoints(student.points)} {/* NEW COLUMN DATA */}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-500"> {/* Updated colspan to 8 */}
                          No paid students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls - same as before */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
                <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                  Showing {paidStudents.length} of {totalStudents} paid students
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded mr-2 ${
                      currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Previous
                  </button>

                  <span className="text-gray-700 mx-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded ml-2 ${
                      currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}