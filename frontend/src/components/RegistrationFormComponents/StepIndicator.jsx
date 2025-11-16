// frontend\src\components\RegistrationFormComponents\StepIndicator.jsx
import React from 'react';
import { User, BookOpen, Image, Check } from 'lucide-react';

const StepIndicator = ({ step, title, active, completed }) => {
  const getIcon = () => {
    if (completed) return <Check size={20} className="text-white" />;
    switch(step) {
      case 1: return <User size={20} className={`${active ? 'text-white' : 'text-gray-700'}`} />;
      case 2: return <BookOpen size={20} className={`${active ? 'text-white' : 'text-gray-700'}`} />;
      case 3: return <Image size={20} className={`${active ? 'text-white' : 'text-gray-700'}`} />;
      default: return null;
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
        ${active ? 'bg-blue-600 transform scale-110' : completed ? 'bg-green-500' : 'bg-gray-200'}`}>
        {getIcon()}
      </div>
      <span className={`text-sm transition-all duration-300 ${active ? 'text-blue-600 font-medium' : completed ? 'text-green-500 font-medium' : 'text-gray-600'}`}>
        {title}
      </span>
    </div>
  );
};

export default StepIndicator;