export const initialFormData = {
  lastName: '',
  firstName: '',
  middleName: '',
  motherName: '',
  batchYear: '',
  semester: '',
  mobile: '',
  email: '',
  photo: null,
};

export const formReducer = (state, action) => {
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

export const validateField = (name, value) => {
  switch (name) {
    case 'lastName':
    case 'firstName':
    case 'motherName':
      return value.trim() !== '' ? '' : 'This field is required.';
    case 'mobile':
      return /^\d{10}$/.test(value) ? '' : 'Enter a valid 10-digit number.';
    case 'email':
      return /\S+@\S+\.\S+/.test(value) ? '' : 'Enter a valid email.';
    default:
      return '';
  }
};

export const validateCurrentStep = (step, formData, setFormError) => {
  let hasError = false;
  const fieldsToValidate = {
    1: ['lastName', 'firstName', 'motherName', 'mobile', 'email'],
  };

  const newErrors = {};
  fieldsToValidate[step]?.forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) {
      newErrors[field] = error;
      hasError = true;
    }
  });

  if (hasError) {
    setFormError("Please fill the highlighted '*' part before proceeding.");
    return false;
  }

  setFormError("");
  return true;
};

export const addAnimationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutLeft {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-100%); opacity: 0; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .animate-slide-in-left {
      animation: slideInLeft 0.4s ease-out forwards;
    }
    .animate-slide-in-right {
      animation: slideInRight 0.4s ease-out forwards;
    }
    .animate-slide-out-left {
      animation: slideOutLeft 0.3s ease-in forwards;
    }
    .animate-slide-out-right {
      animation: slideOutRight 0.3s ease-in forwards;
    }
  `;
  document.head.appendChild(style);
};

export const getStepClasses = (currentStep, targetStep, animating, direction) => {
  if (currentStep !== targetStep) return 'hidden';
  let animationClass = '';
  if (animating) {
    animationClass = direction === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right';
  } else {
    animationClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  }
  return `relative ${animationClass}`;
};