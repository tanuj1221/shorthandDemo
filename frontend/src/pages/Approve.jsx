// src/pages/Approve.jsx
import React, { useEffect, useState } from 'react';
import StudentsTable from '../components/ApproveComponent/StudentsTable';
import ApprovalControls from '../components/ApproveComponent/ApprovalControls';

function Approve() {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [utrFilter, setUtrFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (utrFilter.trim()) {
      params.append('utr', utrFilter.trim());
    }
    
    const url = `/approve${params.toString() ? '?' + params.toString() : ''}`;
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Error fetching students:', err);
        setStudents([]);
      });
  }, [utrFilter]);

  const handleSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleApprove = (studentId) => {
    fetch('/approved_student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
        setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
      })
      .catch((err) => {
        console.error('Error approving student:', err);
        alert('Error approving student');
      });
  };

  const handleBulkApprove = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student to approve');
      return;
    }

    fetch('/bulk_approve_students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ids: selectedStudents }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setStudents((prev) => prev.filter((s) => !selectedStudents.includes(s.student_id)));
        setSelectedStudents([]);
      })
      .catch((err) => {
        console.error('Error bulk approving students:', err);
        alert('Error bulk approving students');
      });
  };

  const handleReject = (studentId) => {
    fetch('/rejected_student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
        setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
      })
      .catch((err) => {
        console.error('Error rejecting student:', err);
        alert('Error rejecting student');
      });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold py-4">Approve Students</h2>
        
        {/* UTR Filter Input */}
        <div className="w-64">
          <input
            type="text"
            placeholder="Filter by UTR number..."
            value={utrFilter}
            onChange={(e) => setUtrFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {utrFilter && (
            <p className="text-xs text-gray-500 mt-1">
              {students.length} student(s) found
            </p>
          )}
        </div>
      </div>
      
      <StudentsTable
        students={students || []}
        selectedStudents={selectedStudents}
        onSelect={handleSelect}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <ApprovalControls
        selectedStudents={selectedStudents}
        onApproveAll={handleBulkApprove}
        onRejectAll={() => {
          selectedStudents.forEach(handleReject);
        }}
      />
    </div>
  );
}

export default Approve;
