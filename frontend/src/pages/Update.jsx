import React, { useState } from 'react';

export default function Update() {
  const [studentId, setStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // 🔍 Handle Search - Using GET request instead of PUT with empty body
  const handleSearch = async () => {
    if (!studentId.trim()) return;

    setLoading(true);
    setError('');
    setSelectedStudent(null);

    try {
      const response = await fetch(`http://localhost:3001/update?id=${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Student not found');
      }

      const data = await response.json();

      // Set both selectedStudent and formValues
      setSelectedStudent(data);
      setFormValues({ ...data });
      
      // Handle image preview
      if (data.image && data.image.startsWith('data:image/')) {
        setImagePreview(data.image);
      } else if (data.image) {
        // If it's base64 without data URL prefix
        setImagePreview(`data:image/jpeg;base64,${data.image}`);
      } else {
        setImagePreview('');
      }
      
      setExpanded(false); // Reset expansion when new search happens
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ Handle Enter Key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 📝 Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // 🖼️ Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setImagePreview(base64String);
        setFormValues((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle Update - Using PUT request with form data
  const handleUpdate = async () => {
    try {
      // Map form values to match backend expectations
      const updateData = {
        first_name: formValues.firstName || formValues.first_name,
        last_name: formValues.lastName || formValues.last_name,
        middle_name: formValues.middleName || formValues.middle_name,
        mothers_name: formValues.motherName || formValues.mothers_name,
        amount: formValues.amount,
        subject_id: formValues.subjectsId || formValues.subject_id,
        image_url: formValues.image || formValues.image_url
      };

      const response = await fetch(`http://localhost:3001/update?id=${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update student');
      }

      alert('Student updated successfully!');
      
      // Update display with returned student data if available
      if (result.student) {
        setSelectedStudent(result.student);
        setFormValues({ ...result.student });
      }
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-6">
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Student Update Page</h1>

      {/* 🔍 Search Bar - Centered */}
      <div className="w-full max-w-md mb-8 flex space-x-2 items-center justify-center">
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Student ID"
          className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* 🧾 Display Found Student */}
      {selectedStudent ? (
        <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Student ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Mother's Name</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Batch</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Course</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{formValues.student_id || ''}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {`${formValues.firstName || ''} ${formValues.middleName || ''} ${formValues.lastName || ''}`.trim()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{formValues.motherName || ''}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formValues.amount || ''}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formValues.batchNo || ''}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formValues.courseId || ''}</td>
              </tr>

              {/* Collapsible Row */}
              {expanded && (
                <tr>
                  <td colSpan="7" className="p-0">
                    <div className="p-6 bg-gray-50 border-t">
                      <h2 className="text-xl font-semibold mb-6 text-gray-800">Edit Student Information</h2>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Personal Info */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Personal Information</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              name="firstName"
                              value={formValues.firstName || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                            <input
                              type="text"
                              name="middleName"
                              value={formValues.middleName || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              name="lastName"
                              value={formValues.lastName || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                            <input
                              type="text"
                              name="motherName"
                              value={formValues.motherName || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                            <input
                              type="tel"
                              name="mobile_no"
                              value={formValues.mobile_no || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formValues.email || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Middle Column - Academic Info */}  
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Academic Information</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Institute ID</label>
                            <input
                              type="text"
                              name="instituteId"
                              value={formValues.instituteId || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course ID</label>
                            <input
                              type="text"
                              name="courseId"
                              value={formValues.courseId || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject ID</label>
                            <input
                              type="text"
                              name="subjectsId"
                              value={formValues.subjectsId || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                            <input
                              type="text"
                              name="batchNo"
                              value={formValues.batchNo || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
                            <input
                              type="text"
                              name="batch_year"
                              value={formValues.batch_year || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                            <input
                              type="text"
                              name="sem"
                              value={formValues.sem || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                            <input
                              type="number"
                              name="amount"
                              value={formValues.amount || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Right Column - Image and Dates */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Image & Dates</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Student Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {imagePreview && (
                              <div className="mt-3">
                                <img
                                  src={imagePreview}
                                  alt="Student"
                                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Start Date</label>
                            <input
                              type="date"
                              name="batchStartDate"
                              value={formValues.batchStartDate || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Batch End Date</label>
                            <input
                              type="date"
                              name="batchEndDate"
                              value={formValues.batchEndDate || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Time</label>
                            <input
                              type="text"
                              name="rem_time"
                              value={formValues.rem_time || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                              name="done"
                              value={formValues.done || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Status</option>
                              <option value="0">In Progress</option>
                              <option value="1">Completed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Login Status</label>
                            <select
                              name="loggedin"
                              value={formValues.loggedin || ''}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Status</option>
                              <option value="0">Logged Out</option>
                              <option value="1">Logged In</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleUpdate}
                        className="w-full mt-8 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                      >
                        Update Student Information
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      ) : loading ? (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <p className="text-blue-700 text-center">Loading...</p>
        </div>
      ) : null}
    </div>
  );
}