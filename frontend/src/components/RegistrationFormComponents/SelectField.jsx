// frontend\src\components\RegistrationFormComponents\SelectField.jsx
import React from 'react';

const SelectField = ({ label, name, value, onChange, options, required = false }) => (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-300 ease-in-out hover:border-blue-300"
    >
      <option value="">Select {label}</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default SelectField; 