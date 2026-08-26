"use client";

import React, { useId, useRef, useState } from "react";
import { Upload, FileText, CheckCircle, Loader2, Rocket, AlertCircle, X } from "lucide-react";
import { useSubscription } from "./SubscriptionProvider";
import { validateResumeFile, formatBytes } from "../lib/file-validation";

function FileUpload({ onAnalyze, hideJobDescription = false }) {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState(null);

  const inputRef = useRef(null);

  // Unique ids so the label/description associations are valid even if two
  // uploads ever render on one page.
  const fileInputId = useId();
  const fileHelpId = useId();
  const fileErrorId = useId();
  const jobDescId = useId();

  // The tier's file-size limit, when we know it. SubscriptionProvider may still
  // be loading, or the user may not be signed in -- in that case we skip the
  // size check and let the server decide.
  const { subscriptionStatus } = useSubscription();
  const maxFileSize = subscriptionStatus?.limits?.maxFileSize;
  const tierName = subscriptionStatus?.tierConfig?.name;

  const acceptFile = (candidate) => {
    if (!candidate) return;

    const result = validateResumeFile(candidate, { maxFileSize, tierName });

    if (!result.valid) {
      // Reject it loudly. Previously an invalid drop was swallowed in silence
      // and the user was left staring at an unchanged form.
      setFile(null);
      setFileError(result.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFile(candidate);
    setFileError(null);
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || fileError) return;
    if (!hideJobDescription && !jobDesc.trim()) return;

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
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const dropZoneBorder = fileError
    ? "border-red-400 bg-red-50"
    : dragOver
    ? "border-blue-400 bg-blue-50"
    : file
    ? "border-green-400 bg-green-50"
    : "border-slate-300 hover:border-slate-400";

  const isSubmitDisabled =
    !file ||
    !!fileError ||
    (!hideJobDescription && !jobDesc.trim()) ||
    isAnalyzing;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Upload size={28} aria-hidden="true" />
          Upload &amp; Analyze
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
          <label
            htmlFor={fileInputId}
            className="block text-sm font-semibold text-slate-700 mb-3"
          >
            Resume Upload
          </label>

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dropZoneBorder}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id={fileInputId}
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              aria-describedby={fileError ? fileErrorId : fileHelpId}
              aria-invalid={fileError ? "true" : undefined}
              onChange={(e) => acceptFile(e.target.files?.[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  fileError ? "bg-red-100" : file ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                {fileError ? (
                  <AlertCircle className="text-red-600" size={32} aria-hidden="true" />
                ) : file ? (
                  <CheckCircle className="text-green-600" size={32} aria-hidden="true" />
                ) : (
                  <FileText className="text-slate-500" size={32} aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700 break-all">
                  {file ? file.name : "Drop your PDF resume here"}
                </p>
                <p id={fileHelpId} className="text-sm text-slate-500 mt-1">
                  {file
                    ? `${formatBytes(file.size)} · ready for analysis`
                    : maxFileSize
                    ? `or click to browse — PDF, up to ${formatBytes(maxFileSize)}`
                    : "or click to browse — PDF only"}
                </p>
              </div>
            </div>

            {/* Sits above the overlaid file input so it stays clickable. */}
            {file && !isAnalyzing && (
              <button
                type="button"
                onClick={clearFile}
                aria-label={`Remove ${file.name}`}
                className="absolute top-3 right-3 z-10 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>

          {fileError && (
            <p
              id={fileErrorId}
              role="alert"
              className="flex items-start gap-2 text-sm text-red-700"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{fileError}</span>
            </p>
          )}
        </div>

        {/* Job Description Section - Only show if not hidden */}
        {!hideJobDescription && (
          <div className="space-y-3">
            <label
              htmlFor={jobDescId}
              className="block text-sm font-semibold text-slate-700"
            >
              Job Description
            </label>
            <div className="relative">
              <textarea
                id={jobDescId}
                rows="8"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                /* A real placeholder. This used to be an absolutely positioned
                   div sitting on top of the textarea, which overlapped the text
                   as soon as the user started typing near it. */
                placeholder={
                  "Paste the job description here...\n\nExample:\n• 3+ years of experience in React development\n• Strong knowledge of JavaScript, HTML, CSS\n• Experience with REST APIs\n• Bachelor's degree in Computer Science"
                }
                className="w-full border border-slate-300 rounded-xl p-4 pb-8 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
              <div
                className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none"
                aria-hidden="true"
              >
                {jobDesc.length} characters
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" size={20} aria-hidden="true" />
              Analyzing Resume...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Rocket size={20} aria-hidden="true" />
              Analyze Resume
            </div>
          )}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;
