'use client';

import React, { useState, useEffect, useRef } from 'react';
import FileUpload from '../../components/FileUpload';
import UpgradeModal from '../../components/UpgradeModal';
import ToolLayout, { toFriendlyError } from '../../components/ToolLayout';
import AnalysisProgress, { JOB_MATCH_STAGES } from '../../components/AnalysisProgress';
import JobMatchResults from '../../components/results/JobMatchResults';
import {
  trackResumeUpload,
  trackAnalysisStart,
  trackAnalysisComplete,
  trackAnalysisError,
  trackPageView
} from '../../lib/analytics';

const INCLUDES = [
  { title: 'Match score', detail: 'How closely your resume fits this posting, out of 100.' },
  { title: 'Missing keywords', detail: 'Terms from the job description your resume does not use.' },
  { title: 'Skills comparison', detail: 'Skills you share with the role, and the ones it asks for that you lack.' },
  { title: 'Section feedback', detail: 'Notes on each part of your resume, from summary to projects.' },
  { title: 'Priority actions', detail: 'The few changes worth making first.' },
];

export default function ResumeAnalysisPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);
  const lastRun = useRef(null);

  useEffect(() => {
    // Track page view when component mounts
    trackPageView('resume_analysis');
  }, []);

  const handleAnalysis = async (file, jobDescription) => {
    lastRun.current = [file, jobDescription];
    const startTime = Date.now();

    // Track resume upload
    trackResumeUpload(file.size, file.type);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Track analysis start
    trackAnalysisStart(!!jobDescription.trim());

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      // Handle subscription limit reached
      if (data.status === 'LIMIT_REACHED') {
        setUpgradeData({
          reason: 'LIMIT_REACHED',
          featureType: 'analyze',
          tier: data.tier,
          used: data.used,
          remaining: data.remaining,
          limit: data.limit,
          resetDate: data.resetDate,
        });
        setShowUpgradeModal(true);
        return;
      }

      // Handle file too large
      if (data.status === 'FILE_TOO_LARGE') {
        setUpgradeData({
          reason: 'FILE_TOO_LARGE',
          featureType: 'analyze',
          tier: data.tier,
          maxSize: data.maxSize,
          currentSize: data.currentSize,
        });
        setShowUpgradeModal(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      if (data.status === 'error') {
        throw new Error(data.error || 'Server error occurred');
      }

      // Track successful analysis
      const duration = Date.now() - startTime;
      trackAnalysisComplete(data.score || 0, duration);

      setResult(data);
    } catch (err) {
      console.error('Error:', err);

      // Track analysis error
      trackAnalysisError('analysis_failed', err.message);

      setError(toFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToolLayout
        title="Job match"
        description="Compare your resume with a job description. See your match score, the keywords you are missing, and what to change first."
        featureType="analyze"
        input={<FileUpload onAnalyze={handleAnalysis} hideJobDescription={false} />}
        includes={INCLUDES}
        isLoading={isLoading}
        progress={<AnalysisProgress title="Matching your resume" stages={JOB_MATCH_STAGES} />}
        error={error}
        onRetry={lastRun.current ? () => handleAnalysis(...lastRun.current) : undefined}
        result={result && <JobMatchResults data={result} />}
        onReset={() => { setResult(null); setError(null); }}
      >
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeData?.reason || 'LIMIT_REACHED'}
          featureType="analyze"
          currentTier={upgradeData?.tier || 'free'}
          usageInfo={upgradeData}
        />
      </ToolLayout>
    </>
  );
}
