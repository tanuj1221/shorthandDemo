import React from 'react';

const PassageForm = ({ formData, handleChange, handleSubmit, handleError }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitToBackend = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    handleError(""); // Clear previous errors

    // Validate all fields
    if (!formData.subject || !formData.audioFile || !formData.recorderBy || !formData.answer) {
      handleError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subjectName', formData.subject);
      formDataToSend.append('recorderBy', formData.recorderBy);
      formDataToSend.append('answer', formData.answer);
      formDataToSend.append('audioFile', formData.audioFile);

      const response = await fetch('https://www.shorthandexam.in/submit-audio', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }
      
      handleSubmit(e); // Call parent's submit handler on success
    } catch (error) {
      handleError(error.message || "Failed to submit audio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitToBackend} className="space-y-5">
      {/* Subject Dropdown */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
          Subject:
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          <option value="">Select a subject</option>
          <optgroup label="English Shorthand">
            <option value="English Shorthand 60 wpm">60 wpm</option>
            <option value="English Shorthand 80 wpm">80 wpm</option>
            <option value="English Shorthand 100 wpm">100 wpm</option>
            <option value="English Shorthand 120 wpm">120 wpm</option>
            <option value="English Shorthand 130 wpm">130 wpm</option>
            <option value="English Shorthand 140 wpm">140 wpm</option>
            <option value="English Shorthand 150 wpm">150 wpm</option>
            <option value="English Shorthand 160 wpm">160 wpm</option>
          </optgroup>
          <optgroup label="Marathi Shorthand">
            <option value="Marathi Shorthand 60 wpm">60 wpm</option>
            <option value="Marathi Shorthand 80 wpm">80 wpm</option>
            <option value="Marathi Shorthand 100 wpm">100 wpm</option>
            <option value="Marathi Shorthand 120 wpm">120 wpm</option>
          </optgroup>
          <optgroup label="Hindi Shorthand">
            <option value="Hindi Shorthand 60 wpm">60 wpm</option>
            <option value="Hindi Shorthand 80 wpm">80 wpm</option>
            <option value="Hindi Shorthand 100 wpm">100 wpm</option>
            <option value="Hindi Shorthand 120 wpm">120 wpm</option>
          </optgroup>
        </select>
      </div>

      {/* Audio File Input */}
      <div>
        <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700">
          Audio File:
        </label>
        <input
          type="file"
          id="audioFile"
          name="audioFile"
          accept="audio/*"
          onChange={handleChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          required
        />
        {formData.audioFile && (
          <p className="mt-1 text-sm text-gray-500">
            Selected file: {formData.audioFile.name}
          </p>
        )}
      </div>

      {/* Recorder By Input */}
      <div>
        <label htmlFor="recorderBy" className="block text-sm font-medium text-gray-700">
          Recorder By:
        </label>
        <input
          type="text"
          id="recorderBy"
          name="recorderBy"
          value={formData.recorderBy}
          onChange={handleChange}
          placeholder="Enter recorder's name"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Answer Textarea */}
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
          Your Answer:
        </label>
        <textarea
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          rows="5"
          placeholder="Type your answer here..."  
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Audio'}
      </button>
    </form>
  );
};

export default PassageForm;