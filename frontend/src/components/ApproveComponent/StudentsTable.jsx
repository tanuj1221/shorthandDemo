// src/components/StudentsTable.jsx
import React from 'react';
import StudentRow from './StudentRow';

function StudentsTable({ students = [], selectedStudents, onSelect, onApprove, onReject }) {
  const handleSelectAll = () => {
    const allSelected = students.length > 0 && selectedStudents.length === students.length;
    if (allSelected) {
      // Deselect all
      students.forEach(student => {
        if (selectedStudents.includes(student.student_id)) {
          onSelect(student.student_id);
        }
      });
    } else {
      // Select all
      students.forEach(student => {
        if (!selectedStudents.includes(student.student_id)) {
          onSelect(student.student_id);
        }
      });
    }
  };

  const isAllSelected = students.length > 0 && selectedStudents.length === students.length;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < students.length;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Student Applications</h3>
            <p className="text-sm text-gray-600 mt-1">
              {students.length} total students • {selectedStudents.length} selected
            </p>
          </div>
          {selectedStudents.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedStudents.length} selected
              </span>
              <div className="h-4 w-px bg-gray-300"></div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Bulk Actions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                UTR Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Institute
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
                    <p className="text-sm text-gray-500">No student applications are available at the moment.</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <StudentRow
                  key={student.student_id}
                  student={student}
                  isSelected={selectedStudents.includes(student.student_id)}
                  onSelect={onSelect}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {students.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {students.length} of {students.length} students
            </span>
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsTable;