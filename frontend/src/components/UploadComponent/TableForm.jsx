import { Upload, Check } from 'lucide-react';

export const TableForm = ({
  tableName,
  setTableName,
  fileName,
  isUploading,
  isSuccess,
  onSubmit
}) => {
  return (
    <div>
      <div className="mb-6">
        <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-2">
          Table Name
        </label>
        <input
          type="text"
          id="tableName"
          placeholder="Enter table name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!fileName || !tableName || isUploading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all
          ${!fileName || !tableName 
            ? 'bg-gray-400 cursor-not-allowed' 
            : isSuccess 
              ? 'bg-green-500' 
              : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        <div className="flex items-center justify-center gap-2">
          {isUploading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Uploading...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check size={20} />
              <span>Success!</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span>Upload</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};