'use client';

import React, { useRef, useState } from 'react';
import FileUpload from '../../components/FileUpload';
import UpgradeModal from '../../components/UpgradeModal';
import ToolLayout, { toFriendlyError } from '../../components/ToolLayout';
import AnalysisProgress, { ANALYTICS_STAGES } from '../../components/AnalysisProgress';
import AnalyticsResults from '../../components/results/AnalyticsResults';

const INCLUDES = [
  { title: 'Overall score and grade', detail: 'A score out of 100 for the resume on its own, no job description needed.' },
  { title: 'ATS compatibility', detail: 'What helps and what hurts when screening software reads your file.' },
  { title: 'Section by section', detail: 'A score, feedback and suggestions for each section.' },
  { title: 'Detailed metrics', detail: 'Content, structure, completeness and keyword use, broken down.' },
  { title: 'Recommended actions', detail: 'Specific changes, ordered by priority.' },
];

export default function AnalyticsPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);
  const lastFile = useRef(null);

  const handleAnalysis = async (file) => {
    lastFile.current = file;
    const formData = new FormData();
    formData.append('resume', file);

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-overall', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      // Handle subscription limit reached
      if (data.status === 'LIMIT_REACHED') {
        setUpgradeData({
          reason: 'LIMIT_REACHED',
          featureType: 'analytics',
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
          featureType: 'analytics',
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

      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(toFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToolLayout
        title="Resume analytics"
        description="A full review of your resume on its own: an overall score, ATS compatibility, and feedback on every section."
        featureType="analytics"
        input={<FileUpload onAnalyze={handleAnalysis} hideJobDescription={true} />}
        includes={INCLUDES}
        isLoading={isLoading}
        progress={<AnalysisProgress title="Reviewing your resume" stages={ANALYTICS_STAGES} />}
        error={error}
        onRetry={lastFile.current ? () => handleAnalysis(lastFile.current) : undefined}
        result={result && <AnalyticsResults data={result} />}
        onReset={() => { setResult(null); setError(null); }}
      >
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeData?.reason || 'LIMIT_REACHED'}
          featureType="analytics"
          currentTier={upgradeData?.tier || 'free'}
          usageInfo={upgradeData}
        />
      </ToolLayout>
    </>
  );
}
