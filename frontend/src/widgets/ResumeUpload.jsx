import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api.js";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentResume, setCurrentResume] = useState(null);

  useEffect(() => {
    // Fetch current resume on component mount
    const fetchResume = async () => {
      try {
        const res = await api.get("/candidate/profile");
        if (res.data?.candidate?.resumeUrl) {
          setCurrentResume(res.data.candidate.resumeUrl);
        }
      } catch (err) {
        // Silent failure for profile fetch in widget is acceptable, or debug log
        // console.debug("Failed to fetch resume:", err);
      }
    };
    fetchResume();
  }, []);

  const onUpload = async () => {
    if (!file || uploading) return;

    // Validate file type
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.warn("Invalid file type. Please upload PDF, DOC, DOCX, or TXT.");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("resume", file);
    try {
      const res = await api.post("/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Uploaded successfully. Your matches will update shortly.");
      // Update current resume after successful upload
      if (res.data?.candidate?.resumeUrl) {
        setCurrentResume(res.data.candidate.resumeUrl);
      }
      setFile(null); // Clear file input

      // Trigger profile refresh event for ProfileCard
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 16l-4-4-4 4M12 12v9"></path>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
        </svg>
        Update Your Resume
      </h3>

      {/* Show current resume if exists */}
      {currentResume && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Current: </span>
              {currentResume.split('/').pop() || 'resume.pdf'}
            </p>
          </div>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Drag & drop your file here or</p>
        <input
          type="file"
          id="resume-upload"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label
          htmlFor="resume-upload"
          className="inline-block px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
        >
          Choose File
        </label>
        {file && (
          <p className="text-xs text-gray-500 mt-2">Selected: {file.name}</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onUpload}
          disabled={!file || uploading}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div >
  );
}
