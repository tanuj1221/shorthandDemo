// src/pages/Approve.jsx
import React, { useEffect, useState } from 'react';
import StudentsTable from '../components/ApproveComponent/StudentsTable';
import ApprovalControls from '../components/ApproveComponent/ApprovalControls';

function Approve() {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/approve')
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error('Error fetching students:', err));
  }, []);

  const handleSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleApprove = (studentId) => {
    fetch('http://localhost:3001/approved_student', {
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

  const handleReject = (studentId) => {
    fetch('http://localhost:3001/rejected_student', {
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
      <h2 className="text-4xl font-bold mb-4 text-center py-4 h-24">Approve Students</h2>
      
      <StudentsTable
        students={students || []}
        selectedStudents={selectedStudents}
        onSelect={handleSelect}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <ApprovalControls
        selectedStudents={selectedStudents}
        onApproveAll={() => {
          selectedStudents.forEach(handleApprove);
        }}
        onRejectAll={() => {
          selectedStudents.forEach(handleReject);
        }}
      />
    </div>
  );
}

export default Approve;
