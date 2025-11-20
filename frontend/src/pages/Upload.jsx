// frontend/src/pages/Upload.jsx
import { useState } from "react";
import { FileUploader } from "../components/UploadComponent/FileUploader";
import { TableForm } from "../components/UploadComponent/TableForm";

export default function CSVUploadPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [tableName, setTableName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // store backend response

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
    }
  };

  const handleSubmit = async () => {
    if (!file || !tableName) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("excelFile", file);      // 👈 match backend upload.single('excelFile')
      formData.append("tableName", tableName); // 👈 match backend req.body.tableName

      const res = await fetch("http://localhost:3001/upload/excel", {
        method: "POST",
        body: formData,
      });

      // If backend crashes / returns HTML, this will throw
      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        setUploadResult(data); // save backend response
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong while uploading");
    } finally {
      setIsUploading(false);
      setTimeout(() => setIsSuccess(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Upload Excel to Table
          </h1>
          <p className="text-gray-500 text-sm">Import your data seamlessly</p>
        </div>

        <FileUploader fileName={fileName} onFileChange={handleFileChange} />
        <TableForm
          tableName={tableName}
          setTableName={setTableName}
          fileName={fileName}
          isUploading={isUploading}
          isSuccess={isSuccess}
          onSubmit={handleSubmit}
        />

        {/* Show backend response */}
        {uploadResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              ✅ {uploadResult.message}
            </p>
            <p className="text-sm text-gray-600">
              Table: <b>{uploadResult.tableName}</b> <br />
              Rows inserted: <b>{uploadResult.rowsInserted}</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}