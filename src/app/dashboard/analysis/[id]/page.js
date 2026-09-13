'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../../../components/Navbar';
import JobMatchResults from '../../../../components/results/JobMatchResults';
import AnalyticsResults from '../../../../components/results/AnalyticsResults';

// Saved reports are written by /api/analyze (job_match) and
// /api/analyze-overall (overall). Section rewrites are not saved.
const REPORTS = {
  job_match: { label: 'Job match', Component: JobMatchResults },
  overall: { label: 'Resume analytics', Component: AnalyticsResults },
};

const formatDate = (dateString) => {
  const date = dateString ? new Date(dateString) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function AnalysisViewPage({ params }) {
  const analysisId = React.use(params).id;
  const { isLoaded } = useUser();
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !analysisId) return;

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/dashboard/analysis/${analysisId}`);

        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }
        if (response.status === 404) {
          throw new Error("This report doesn't exist, or it has been deleted.");
        }
        if (!response.ok) {
          throw new Error("We couldn't load this report. Try again in a moment.");
        }

        const result = await response.json();
        if (result.status !== 'success' || !result.data) {
          throw new Error("We couldn't load this report. Try again in a moment.");
        }
        setAnalysis(result.data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [isLoaded, analysisId, router]);

  const report = REPORTS[analysis?.analysisType] || REPORTS.job_match;
  const Report = report.Component;

  return (
    <>
      <Navbar />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:py-12">
        <Link href="/dashboard" className="btn btn-ghost -ml-3 h-8 px-3 text-sm">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          Dashboard
        </Link>

        {!isLoaded || loading ? (
          <div className="mt-6 space-y-6" aria-hidden="true">
            <div className="h-10 w-2/3 max-w-md animate-pulse rounded-control bg-sunken" />
            <div className="panel h-72 animate-pulse bg-sunken" />
          </div>
        ) : error ? (
          <div role="alert" className="panel mt-6 border-l-[3px] border-l-critical p-6">
            <p className="text-[15px] text-ink-2">{error}</p>
            <Link href="/dashboard" className="btn btn-secondary mt-4">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <header className="mt-4 border-b border-line pb-8">
              <h1 className="truncate font-mono text-2xl font-medium tracking-tight text-ink md:text-[28px]">
                {analysis.fileName || 'Untitled resume'}
              </h1>
              <p className="mt-2 text-ink-3">
                {report.label}
                {formatDate(analysis.createdAt) && `, ${formatDate(analysis.createdAt)}`}
              </p>
            </header>
            <div className="pt-8">
              {analysis.analysisResult ? (
                <Report data={analysis.analysisResult} />
              ) : (
                <p className="panel p-6 text-ink-2">This report has no saved results.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
