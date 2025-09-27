"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle, Loader2, Rocket } from "lucide-react";

function FileUpload({ onAnalyze, hideJobDescription = false }) {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file && (hideJobDescription || jobDesc.trim())) {
      setIsAnalyzing(true);
      try {
        if (hideJobDescription) {
          await onAnalyze(file);
        } else {
          await onAnalyze(file, jobDesc);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Upload size={28} />
          Upload & Analyze
        </h2>
        <p className="text-blue-100 mt-2">
          {hideJobDescription
            ? "Upload your resume to get comprehensive analytics and insights"
            : "Upload your resume and job description to get AI-powered insights"}
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* File Upload Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Resume Upload
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : file
                ? "border-green-400 bg-green-50"
                : "border-slate-300 hover:border-slate-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  file ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                {file ? (
                  <CheckCircle className="text-green-600" size={32} />
                ) : (
                  <FileText className="text-slate-500" size={32} />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">
                  {file ? file.name : "Drop your PDF resume here"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {file
                    ? "File ready for analysis"
                    : "or click to browse files"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description Section - Only show if not hidden */}
        {!hideJobDescription && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Job Description
            </label>
            <div className="relative">
              <textarea
                rows="8"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Paste the job description here..."
              />
              {!jobDesc && (
                <div className="absolute top-12 left-4 text-slate-400 text-sm pointer-events-none">
                  <div className="mb-2">Example:</div>
                  <div>• 3+ years of experience in React development</div>
                  <div>• Strong knowledge of JavaScript, HTML, CSS</div>
                  <div>• Experience with REST APIs</div>
                  <div>• Bachelor's degree in Computer Science...</div>
                </div>
              )}
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {jobDesc.length} characters
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            !file || (!hideJobDescription && !jobDesc.trim()) || isAnalyzing
          }
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" size={20} />
              {hideJobDescription
                ? "Analyzing Resume..."
                : "Analyzing Resume..."}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Rocket size={20} />
              {hideJobDescription ? "Analyze Resume" : "Analyze Resume"}
            </div>
          )}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;
