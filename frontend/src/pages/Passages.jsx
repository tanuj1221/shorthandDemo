import React, { useState } from "react";
import PassageHeader from "../components/PassagesComponents/PassageHeader";
import MessageAlert from "../components/PassagesComponents/MessageAlert";
import PassageForm from "../components/PassagesComponents/PassageForm";

const Passages = () => {
  const [formData, setFormData] = useState({
    subject: "",
    audioFile: null,
    recorderBy: "",
    answer: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "audioFile") {
      setFormData((prevData) => ({
        ...prevData,
        audioFile: files[0],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    // Reset form after successful submission
    setFormData({
      subject: "",
      audioFile: null,
      recorderBy: "",
      answer: "",
    });
    setMessage("Audio submitted successfully!");
  };

  const handleError = (errorMessage) => {
    setMessage(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-7 px-4 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl">
        <PassageHeader />
        <MessageAlert message={message} />
        <PassageForm 
          formData={formData} 
          handleChange={handleChange} 
          handleSubmit={handleSubmit}
          handleError={handleError}
        />
      </div>
    </div>
  );
};

export default Passages;