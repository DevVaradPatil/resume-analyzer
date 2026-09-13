'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { MoreHorizontal, Plus } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PlanPanel from '../../components/PlanPanel';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getScoreLabel, getScoreTextColor, toScore } from '../../lib/score';

const EMPTY_STATS = {
  totalResumes: 0,
  totalAnalyses: 0,
  averageScore: 0,
  lastAnalysisAt: null,
};

const REPORT_TYPES = {
  job_match: 'Job match',
  overall: 'Resume analytics',
  section_improvement: 'Section rewrite',
};

const formatDate = (dateString) => {
  const date = dateString ? new Date(dateString) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Per-row "Open / Delete" menu. Closes on Escape (returning focus to its
 * button), on outside click, and after choosing an item.
 */
function RowMenu({ label, href, onDelete }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    rootRef.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const itemClass =
    'flex h-9 w-full items-center rounded-[6px] px-3 text-left text-sm transition-colors hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none';

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${label}`}
        className="btn btn-ghost h-8 w-8 px-0"
      >
        <MoreHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`Actions for ${label}`}
          className="panel absolute right-0 top-9 z-20 w-36 p-1 shadow-raised animate-slideIn"
        >
          <Link href={href} role="menuitem" className={`${itemClass} text-ink`}>
            Open
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onDelete(); }}
            className={`${itemClass} text-critical`}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion state. `pendingDelete` holds either a single analysis row or the
  // sentinel { all: true } for the erase-everything flow.
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        throw new Error(response.status === 401 ? 'unauthorized' : 'failed');
      }

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        setStats(result.data.stats || EMPTY_STATS);
        setRecentAnalyses(Array.isArray(result.data.recentAnalyses) ? result.data.recentAnalyses : []);
      } else {
        setStats(EMPTY_STATS);
        setRecentAnalyses([]);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(
        err.message === 'unauthorized'
          ? 'Your session has ended. Sign in again to see your reports.'
          : "We couldn't load your reports."
      );
      setStats(EMPTY_STATS);
      setRecentAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      fetchDashboardData();
    }
  }, [isLoaded, fetchDashboardData]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    const isDeleteAll = pendingDelete.all === true;
    const endpoint = isDeleteAll
      ? '/api/dashboard/data'
      : `/api/dashboard/analysis/${pendingDelete.id}`;

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.error || result.message || 'Failed to delete');
      }

      // Update locally rather than refetching, so the row disappears at once.
      if (isDeleteAll) {
        setRecentAnalyses([]);
        setStats(EMPTY_STATS);
      } else {
        setRecentAnalyses((prev) => prev.filter((a) => a.id !== pendingDelete.id));
        setStats((prev) =>
          prev ? { ...prev, totalResumes: Math.max(0, (prev.totalResumes || 0) - 1) } : prev
        );
      }

      setPendingDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteError("That didn't delete. Nothing was removed, so you can try again.");
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const firstName = user?.firstName;

  return (
    <>
      <Navbar />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink md:text-4xl md:leading-[42px]">
              {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
            </h1>
            <p className="mt-2 text-ink-2">Your plan, this month's usage, and your saved reports.</p>
          </div>
          <Link href="/resume-analysis" className="btn btn-primary">
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            New analysis
          </Link>
        </header>

        <div className="mt-8">
          <PlanPanel />
        </div>

        <section aria-labelledby="reports-title" className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 id="reports-title" className="text-xl font-semibold tracking-tight text-ink">
              Recent reports
            </h2>
            <nav aria-label="Start a report" className="hidden gap-4 text-sm sm:flex">
              <Link href="/analytics" className="text-accent hover:text-accent-hover">Resume analytics</Link>
              <Link href="/section-improvement" className="text-accent hover:text-accent-hover">Improve a section</Link>
            </nav>
          </div>

          {!isLoaded || loading ? (
            <div className="panel divide-y divide-line" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-sunken" />
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-sunken" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="panel border-l-[3px] border-l-critical p-6">
              <p className="text-[15px] text-ink-2">{error}</p>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchDashboardData(); }}
                className="btn btn-secondary mt-4"
              >
                Try again
              </button>
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="panel p-8">
              <p className="text-[15px] text-ink-2">No reports yet. Your first analysis appears here.</p>
              <Link href="/resume-analysis" className="btn btn-primary mt-4">
                Analyze resume
              </Link>
            </div>
          ) : (
            <div className="panel">
              <div
                aria-hidden="true"
                className="hidden grid-cols-[minmax(0,1fr)_150px_110px_120px_32px] gap-4 border-b border-line px-5 py-2.5 text-[13px] font-medium text-ink-3 md:grid"
              >
                <span>File</span>
                <span>Report</span>
                <span>Score</span>
                <span>Date</span>
                <span />
              </div>
              <ul className="divide-y divide-line">
                {recentAnalyses.map((analysis) => {
                  const name = analysis.file_name || 'Untitled resume';
                  const href = `/dashboard/analysis/${analysis.id}`;
                  const score = toScore(analysis.score);
                  const kind = analysis.analysis_type === 'job_match' ? 'match' : 'quality';

                  return (
                    <li
                      key={analysis.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-canvas md:grid-cols-[minmax(0,1fr)_150px_110px_120px_32px]"
                    >
                      <Link href={href} className="truncate font-mono text-[13px] text-ink hover:text-accent">
                        {name}
                      </Link>
                      <span className="col-start-1 row-start-2 text-sm text-ink-3 md:col-start-auto md:row-start-auto md:text-ink-2">
                        {REPORT_TYPES[analysis.analysis_type] || 'Report'}
                        <span className="md:hidden">{formatDate(analysis.created_at) && `, ${formatDate(analysis.created_at)}`}</span>
                      </span>
                      <span className="col-start-2 row-span-2 row-start-1 text-right md:col-start-auto md:row-span-1 md:row-start-auto md:text-left">
                        {score !== null ? (
                          <>
                            <span aria-hidden="true" className={`text-base font-semibold tabular-nums ${getScoreTextColor(score)}`}>
                              {score}
                            </span>
                            <span className="sr-only">{score} out of 100, {getScoreLabel(score, kind)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-ink-3">No score</span>
                        )}
                      </span>
                      <span className="hidden text-sm text-ink-2 tabular-nums md:block">{formatDate(analysis.created_at)}</span>
                      <div className="col-start-3 row-span-2 row-start-1 md:col-start-auto md:row-span-1 md:row-start-auto">
                        <RowMenu
                          label={name}
                          href={href}
                          onDelete={() => { setDeleteError(null); setPendingDelete(analysis); }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Your data: retention and erasure */}
        <section aria-labelledby="data-title" className="panel mt-8 p-6">
          <h2 id="data-title" className="text-base font-semibold text-ink">Your data</h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
            Your uploaded resumes and their analyses are stored so you can revisit
            them from this dashboard. Analyses are automatically deleted 12 months
            after they are created. You can remove any single report above, or
            erase everything at once.
          </p>

          {deleteError && (
            <p role="alert" className="mt-4 text-sm text-critical">{deleteError}</p>
          )}

          <button
            type="button"
            onClick={() => { setDeleteError(null); setPendingDelete({ all: true }); }}
            disabled={recentAnalyses.length === 0 && !stats?.totalResumes}
            className="btn mt-4 bg-critical/10 text-critical hover:bg-critical/15"
          >
            Delete all my data
          </button>

          <p className="mt-3 text-[13px] text-ink-3">
            This removes your stored resumes and analysis history. It does not delete
            your account.
          </p>
        </section>
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        isProcessing={isDeleting}
        title={
          pendingDelete?.all
            ? 'Delete all your data?'
            : 'Delete this report?'
        }
        message={
          pendingDelete?.all
            ? 'Every resume you have uploaded and all analysis history will be permanently deleted. This cannot be undone. Your account will remain active.'
            : `"${pendingDelete?.file_name || 'This report'}" and its results will be permanently deleted. This cannot be undone.`
        }
        confirmLabel={pendingDelete?.all ? 'Delete everything' : 'Delete'}
      />
    </>
  );
}
