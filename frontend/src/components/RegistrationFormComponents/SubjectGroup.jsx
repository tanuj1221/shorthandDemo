// frontend\src\components\RegistrationFormComponents\SubjectGroup.jsx
import React from 'react';

const SubjectGroup = ({ title, subjects, selected, onChange }) => (
  <div className="border border-gray-200 rounded-md p-4 transition duration-300 hover:shadow-md">
    <h3 className="text-md font-semibold text-blue-700 mb-3">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {subjects.map((subject, idx) => (
        <label key={idx} className="flex items-center gap-2 text-sm text-gray-700 transition hover:text-blue-600">
          <input
            type="checkbox"
            value={subject}
            checked={selected.includes(subject)}
            onChange={onChange}
            className="accent-blue-600"
          />
          {subject}
        </label>
      ))}
    </div>
  </div>
);

export default SubjectGroup;