import { FileText, Upload } from 'lucide-react';

export const FileUploader = ({ fileName, onFileChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose CSV File
      </label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-all flex flex-col items-center justify-center cursor-pointer
          ${fileName ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          className="hidden"
          id="csvFile"
        />
        <label htmlFor="csvFile" className="cursor-pointer w-full text-center">
          {fileName ? (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <FileText size={20} />
              <span className="font-medium truncate max-w-xs">{fileName}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Upload size={24} />
              <span>Click to select or drop CSV file</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};