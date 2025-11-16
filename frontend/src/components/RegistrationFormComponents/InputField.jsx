// // frontend\src\components\RegistrationFormComponents\InputField.jsx
import React from 'react';

const InputField = ({ label, name, value, onChange, type = 'text', placeholder = '', required = false, error = '', accept }) => (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {type === 'file' ? (
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept={accept}
        className="border rounded-md p-2 focus:ring-2 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`border rounded-md p-2 focus:ring-2 outline-none transition ${
          error ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default InputField;