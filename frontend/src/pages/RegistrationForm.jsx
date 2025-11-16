// frontend\src\pages\RegistrationForm.jsx
import React, { useState, useEffect, useReducer } from 'react';
import StepIndicator from '../components/RegistrationFormComponents/StepIndicator';
import PersonalInfoStep from '../components/RegistrationFormComponents/PersonalInfoStep';
import SubjectsStep from '../components/RegistrationFormComponents/SubjectsStep';
import PhotoUploadStep from '../components/RegistrationFormComponents/PhotoUploadStep';
import axios from 'axios';

const StudentRegistrationForm = () => {
  // Initial Form State
  const initialFormData = {
  lastName: '',
  firstName: '',
  middleName: '',
  motherName: '',
  batch_year: '', // Changed from batchYear
  sem: '',        // Changed from semester
  mobile_no: '',  // Changed from mobile
  email: '',
  image: null,    
  password: 'defaultPassword', // Add if required
  courseId: null, // Add if required
  batchStartDate: null,
  batchEndDate: null,
  amount: 0,
};

  // Validation Rules
  const validateField = (name, value) => {
    switch (name) {
      case 'lastName':
      case 'firstName':
      case 'motherName':
        return value.trim() !== '' ? '' : 'This field is required.';
      case 'mobile_no':
        return /^\d{10}$/.test(value) ? '' : 'Enter a valid 10-digit number.';
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Enter a valid email.';
      case 'batchYear':
      case 'semester':
        return value.trim() !== '' ? '' : 'This field is required.';
      default:
        return '';
    }
  };

  // Reducer for Form Data
  const formReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_FIELD':
        return {
          ...state,
          [action.field]: action.value,
          errors: {
            ...state.errors,
            [action.field]: validateField(action.field, action.value),
          },
        };
      case 'RESET':
        return { ...initialFormData, errors: {} };
      default:
        return state;
    }
  };

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [animating, setAnimating] = useState(false);
  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');

  // Animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      @keyframes slide-out-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
      @keyframes slide-out-right { from { transform: translateX(0); } to { transform: translateX(100%); } }

      .animate-slide-in-right { animation: slide-in-right 0.3s forwards; }
      .animate-slide-in-left { animation: slide-in-left 0.3s forwards; }
      .animate-slide-out-left { animation: slide-out-left 0.3s forwards; }
      .animate-slide-out-right { animation: slide-out-right 0.3s forwards; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const getStepClasses = (currentStep) => {
    if (step !== currentStep) return 'hidden';
    let animationClass = '';
    if (animating) {
      animationClass = direction === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right';
    } else {
      animationClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';
    }
    return `relative ${animationClass}`;
  };

  const nextStep = () => {
    const isValid = validateCurrentStep();
    if (!isValid) return;
    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setStep((prev) => Math.min(prev + 1, 3));
      setAnimating(false);
    }, 300);
  };

  const prevStep = () => {
    setDirection('backward');
    setAnimating(true);
    setTimeout(() => {
      setStep((prev) => Math.max(prev - 1, 1));
      setAnimating(false);
    }, 300);
  };

  const validateCurrentStep = () => {
    let hasError = false;
    const fieldsToValidate = {
      1: ['lastName', 'firstName', 'motherName', 'mobile_no', 'email'],
    };

    const newErrors = {};
    fieldsToValidate[step]?.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    dispatch({ type: 'UPDATE_FIELD', field: 'errors', value: newErrors });

    if (hasError) {
      setFormError("Please fill all required fields correctly before proceeding.");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  };

  const handleSubjectChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSubjects((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024) {
        setPhotoError('File size should be less than 50KB');
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          dispatch({ 
            type: 'UPDATE_FIELD', 
            field: 'image', 
            value: reader.result 
          });
        };
        reader.readAsDataURL(file);
        setPhotoError('');
      }
    } else if (e.target.value) {
      // Handle cropped image data from PhotoUploadStep
      dispatch({ 
        type: 'UPDATE_FIELD', 
        field: 'image', 
        value: e.target.value 
      });
    }
  };

  const base64ToFile = (base64, filename = 'photo.jpg') => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

    const handleSubmit = async () => {
  if (selectedSubjects.length === 0) {
    alert('Please select at least one subject.');
    return;
  }

  const submissionData = {
    ...formData,
    subjectsId: selectedSubjects,
    loggedIn: 'no',
    done: 'no',
    remTime: "300"
  };

  try {
    const response = await axios.post('https://www.shorthandexam.in/registerstudent', submissionData, {
      withCredentials: true,
    });
    alert('Student registered successfully!');
    window.location.href = '/dashboard/payfees';
  } catch (error) {
    console.error('Registration failed:', error);
    alert(error.response?.data?.message || 'Registration failed');
  }
};

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-8 overflow-hidden">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-500">REGISTER NEW STUDENT</h1>
        </div>

        <div className="flex justify-center mb-6 gap-4">
          <StepIndicator step={1} title="Personal Info" active={step === 1} completed={step > 1} />
          <StepIndicator step={2} title="Subjects" active={step === 2} completed={step > 2} />
          <StepIndicator step={3} title="Photo Upload" active={step === 3} completed={false} />
        </div>

        <hr className="mb-10 border-gray-200" />

        {formError && (
          <div className="text-red-500 text-sm mb-4 text-center">{formError}</div>
        )}

        <div className="relative overflow-hidden min-h-96">
          <div className={getStepClasses(1)}>
            <PersonalInfoStep
              formData={formData}
              handleChange={handleChange}
              nextStep={nextStep}
            />
          </div>
          <div className={getStepClasses(2)}>
            <SubjectsStep
              selectedSubjects={selectedSubjects}
              handleSubjectChange={handleSubjectChange}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          </div>
          <div className={getStepClasses(3)}>
            <PhotoUploadStep
              photoError={photoError}
              handleFileChange={handleFileChange}
              prevStep={prevStep}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;