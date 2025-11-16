// src/components/StudentRow.jsx
import React from 'react';

function StudentRow({ student, isSelected, onSelect, onApprove, onReject }) {
  return (
    <tr className="group hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200">
      <td className="px-4 py-3 text-center">
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(student.student_id)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.student_id}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{student.user}</td>
      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{student.mobile}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{student.email}</td>
      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{student.utr}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{student.date}</td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{student.amount}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{student.instituteId}</td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
            onClick={() => onApprove(student.student_id)}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200 shadow-sm"
            onClick={() => onReject(student.student_id)}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

export default StudentRow;