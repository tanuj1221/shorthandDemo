// frontend\src\components\RegistrationFormComponents\SubjectsStep.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import SubjectGroup from './SubjectGroup';

const SubjectsStep = ({ selectedSubjects, handleSubjectChange, prevStep, nextStep }) => {
  return (
    <>
      <div className="text-xl font-semibold text-gray-800 mb-4">Subjects:</div>
      <div className="space-y-6">
        <SubjectGroup
          title="Others"
          subjects={['Shorthand Dummy Subject']}
          selected={selectedSubjects}
          onChange={handleSubjectChange}
        />
        <SubjectGroup
          title="English"
          subjects={[
            'English Shorthand 60 wpm',
            'English Shorthand 80 wpm',
            'English Shorthand 100 wpm',
            'English Shorthand 120 wpm',
            'English Shorthand 130 wpm',
            'English Shorthand 140 wpm',
            'English Shorthand 150 wpm',
            'English Shorthand 160 wpm',
          ]}
          selected={selectedSubjects}
          onChange={handleSubjectChange}
        />
        <SubjectGroup
          title="Marathi"
          subjects={[
            'Marathi Shorthand 60 wpm',
            'Marathi Shorthand 80 wpm',
            'Marathi Shorthand 100 wpm',
            'Marathi Shorthand 120 wpm',
          ]}
          selected={selectedSubjects}
          onChange={handleSubjectChange}
        />
        <SubjectGroup
          title="Hindi"
          subjects={[
            'Hindi Shorthand 60 wpm',
            'Hindi Shorthand 80 wpm',
            'Hindi Shorthand 100 wpm',
            'Hindi Shorthand 120 wpm',
          ]}
          selected={selectedSubjects}
          onChange={handleSubjectChange}
        />
      </div>
      <div className="flex justify-between mt-10">
        <button
          onClick={prevStep}
          className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition flex items-center gap-1"
        >
          <ChevronLeft size={20} /> Previous
        </button>
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

export default SubjectsStep;