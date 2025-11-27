// frontend\src\pages\PaidStudent.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaidStudentsTable() {
  const [paidStudents, setPaidStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [utrFilter, setUtrFilter] = useState('');

  useEffect(() => {
    const fetchPaidStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://dev.shorthandexam.in/paid-students', {
          params: {
            page: currentPage,
            pageSize: pageSize
          },
          withCredentials: true
        });
        
        setPaidStudents(response.data.data);
        setFilteredStudents(response.data.data);
        setTotalStudents(response.data.totalStudents);
        setError(null);
      } catch (err) {
        console.error('Error fetching paid students:', err);
        setError('Failed to fetch paid students. Please try again later.');
        setPaidStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidStudents();
  }, [currentPage, pageSize]);

  // Get unique UTR numbers
  const uniqueUtrNumbers = [...new Set(paidStudents.map(student => student.utr).filter(utr => utr))];

  // Filter students by UTR number
  useEffect(() => {
    if (!utrFilter || utrFilter === 'all') {
      setFilteredStudents(paidStudents);
    } else {
      const filtered = paidStudents.filter(student => student.utr === utrFilter);
      setFilteredStudents(filtered);
    }
  }, [utrFilter, paidStudents]);

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

          {/* UTR Filter Dropdown */}
          <div className="mb-6">
            <label htmlFor="utrFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by UTR Number
            </label>
            <select
              id="utrFilter"
              value={utrFilter}
              onChange={(e) => setUtrFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All UTR Numbers ({totalStudents} students)</option>
              {uniqueUtrNumbers.sort().map((utr) => (
                <option key={utr} value={utr}>
                  {utr} ({paidStudents.filter(s => s.utr === utr).length} student{paidStudents.filter(s => s.utr === utr).length > 1 ? 's' : ''})
                </option>
              ))}
            </select>
            {utrFilter && utrFilter !== 'all' && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {filteredStudents.length} student(s) with UTR: {utrFilter}
              </p>
            )}
          </div>

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
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
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
                          {utrFilter && utrFilter !== 'all' ? 'No students found with this UTR number' : 'No paid students found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls - same as before */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
                <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                  Showing {filteredStudents.length} of {totalStudents} paid students
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