// src/components/ApprovalControls.jsx
import React from 'react';

function ApprovalControls({ selectedStudents, onApproveAll, onRejectAll }) {
  return (
    <div className="flex gap-4 mt-4">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={selectedStudents.length === 0}
        onClick={onApproveAll}
      >
        Approve Selected
      </button>
      <button
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={selectedStudents.length === 0}
        onClick={onRejectAll}
      >
        Reject Selected
      </button>
    </div>
  );
}

export default ApprovalControls;
