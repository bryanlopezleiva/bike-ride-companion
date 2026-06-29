import { useState } from "react";
import { parseFitFile } from "../../services/ridesApi"; // Matches your file tree

export default function FileImport({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Pass the raw file directly, matching your API function signature
      await parseFitFile(file);
      onUploadSuccess(); // Trigger the history feed refresh in App.jsx
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.message || "Failed to parse .FIT file. Check backend console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center max-w-md mx-auto mb-8">
      <p className="text-sm text-gray-500 mb-4">
        Have a new Garmin or Wahoo workout?
      </p>
      <input
        type="file"
        accept=".fit"
        onChange={handleFileChange}
        className="hidden"
        id="fit-upload"
        disabled={uploading}
      />
      <label
        htmlFor="fit-upload"
        className={`inline-block font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-colors ${
          uploading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {uploading ? "Processing FIT file..." : "Upload .FIT Activity"}
      </label>
    </div>
  );
}
