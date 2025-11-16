// // frontend\src\components\RegistrationFormComponents\PersonalInfoStep.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import InputField from './InputField';
import SelectField from './SelectField';

const PersonalInfoStep = ({ formData, handleChange, nextStep }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 p-1 gap-6">
        <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required error={formData.errors?.lastName} />
        <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required error={formData.errors?.firstName} />
        <InputField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} error={formData.errors?.middleName} />
        <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} required error={formData.errors?.motherName} />
        <SelectField label="Batch Year" name="batch_year" value={formData.batch_year} onChange={handleChange} options={['2025', '2026']} required />
        <SelectField label="Semester" name="sem" value={formData.sem} onChange={handleChange} options={['1', '2']} required />
        <InputField 
          label="Mobile No" 
          name="mobile_no" 
          value={formData.mobile_no} 
          onChange={handleChange}
          type="tel"
          placeholder="10-digit mobile number" 
          required 
          error={formData.errors?.mobile_no}
          pattern="[0-9]{10}"
          title="Please enter exactly 10 digits"
        />
        <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" required error={formData.errors?.email} />
      </div>
      <div className="flex justify-end mt-10">
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-1"
        >
          Next <ChevronLeft className="transform rotate-180" size={20} />
        </button>
      </div>
    </>
  );
};

export default PersonalInfoStep;