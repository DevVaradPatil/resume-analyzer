"use client";

import React, { useId, useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, AlertCircle, X } from "lucide-react";
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

  const isSubmitDisabled =
    !file ||
    !!fileError ||
    (!hideJobDescription && !jobDesc.trim()) ||
    isAnalyzing;

  // Idle and drag-over show the full drop zone. Once a file is chosen (or
  // rejected) it collapses to a single row, so the empty target does not keep
  // competing with the rest of the form.
  const zoneState = fileError ? "error" : file ? "file" : dragOver ? "drag" : "idle";

  const zoneClass = {
    idle: "min-h-40 border-dashed border-line-strong bg-surface hover:border-ink-3",
    drag: "min-h-40 border-solid border-accent bg-accent-soft",
    file: "min-h-16 border-solid border-line bg-surface",
    error: "min-h-16 border-solid border-critical bg-surface",
  }[zoneState];

  const sizeHint = maxFileSize
    ? `PDF up to ${formatBytes(maxFileSize)}${tierName ? ` on ${tierName}` : ""}.`
    : "PDF only.";

  return (
    <form onSubmit={handleSubmit} className="panel p-6 space-y-6 sm:p-8">
      <div className="space-y-2">
        <label htmlFor={fileInputId} className="block text-[13px] font-medium text-ink">
          Resume
        </label>

        <div
          className={`relative flex rounded-panel border-[1.5px] transition-colors ${zoneClass}`}
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
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />

          {zoneState === "idle" || zoneState === "drag" ? (
            <div className="m-auto flex flex-col items-center px-6 py-8 text-center">
              <UploadCloud
                size={24}
                strokeWidth={1.75}
                aria-hidden="true"
                className={zoneState === "drag" ? "text-accent" : "text-ink-3"}
              />
              <p className="mt-3 font-medium text-ink">Drop your resume PDF</p>
              <p id={fileHelpId} className="mt-1 text-sm text-ink-3">
                or click to browse. {sizeHint}
              </p>
            </div>
          ) : (
            <div className="flex w-full items-center gap-3 px-4 py-3">
              <FileText
                size={20}
                strokeWidth={1.75}
                aria-hidden="true"
                className={`shrink-0 ${fileError ? "text-critical" : "text-ink-3"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {file ? file.name : "Choose a different file"}
                </p>
                <p id={fileHelpId} className="text-[13px] text-ink-3">
                  {file ? `${formatBytes(file.size)}, ready to analyze` : sizeHint}
                </p>
              </div>
              {file && !isAnalyzing && (
                /* Sits above the overlaid file input so it stays clickable. */
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label={`Remove ${file.name}`}
                  className="btn btn-ghost relative z-10 h-8 w-8 shrink-0 px-0"
                >
                  <X size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>

        {fileError && (
          <p id={fileErrorId} role="alert" className="flex items-start gap-2 text-sm text-critical">
            <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{fileError}</span>
          </p>
        )}
      </div>

      {!hideJobDescription && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={jobDescId} className="block text-[13px] font-medium text-ink">
              Job description
            </label>
            <span className="text-[13px] text-ink-3 tabular-nums" aria-hidden="true">
              {jobDesc.length} characters
            </span>
          </div>
          <textarea
            id={jobDescId}
            rows={8}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder={
              "Paste the full job post here.\n\nFor example:\n3+ years of React development\nStrong JavaScript, HTML and CSS\nExperience with REST APIs"
            }
            className="field resize-y"
          />
        </div>
      )}

      <button type="submit" disabled={isSubmitDisabled} className="btn btn-primary btn-lg w-full">
        {isAnalyzing ? (
          <>
            <Loader2 size={18} strokeWidth={1.75} className="motion-safe:animate-spin" aria-hidden="true" />
            Analyzing
          </>
        ) : (
          "Analyze resume"
        )}
      </button>
    </form>
  );
}

export default FileUpload;
