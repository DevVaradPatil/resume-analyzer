'use client';

import React, { useEffect, useRef } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import Navbar from './Navbar';
import { useSubscription } from './SubscriptionProvider';
import { AdWrapper, ResultsAd } from './ads';

const USAGE_NOUNS = {
  analyze: ['job match', 'job matches'],
  analytics: ['resume report', 'resume reports'],
  improve: ['section rewrite', 'section rewrites'],
};

function UsageLine({ featureType }) {
  const { subscriptionStatus } = useSubscription();
  const limit = subscriptionStatus?.limits?.[featureType];
  const remaining = subscriptionStatus?.remaining?.[featureType];
  if (typeof limit !== 'number' || typeof remaining !== 'number') return null;

  const [one, many] = USAGE_NOUNS[featureType];
  const text =
    limit === -1
      ? `Unlimited ${many}`
      : `${remaining} of ${limit} ${limit === 1 ? one : many} left this month`;

  return <p className="text-sm text-ink-3 tabular-nums">{text}</p>;
}

/**
 * Maps whatever went wrong to copy a user can act on. The API still returns
 * raw exception text in `error` for some failures; that is logged, not shown.
 */
export function toFriendlyError(err) {
  const message = err?.message || '';
  if (err instanceof TypeError) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (message.startsWith('PDF extraction error')) {
    return "We couldn't read text from this PDF. If it's a scanned image, export it again from your editor as a text PDF.";
  }
  if (message === 'Only PDF files are supported') {
    return 'Only PDF files are supported. Export your resume as a PDF and upload it again.';
  }
  return "The analysis didn't finish. This run doesn't count toward your monthly limit, so you can try again.";
}

/**
 * Frame shared by the three tool pages (DESIGN.md 9.1).
 *
 * Before a report exists: input on the left (5/12), and on the right either a
 * preview of what the report contains, the progress skeleton, or the error.
 * Once a report exists it takes the full width and the input collapses to a
 * "New analysis" button.
 */
export default function ToolLayout({
  title,
  description,
  featureType,
  input,
  includes,
  isLoading,
  progress,
  error,
  onRetry,
  result,
  onReset,
  children,
}) {
  const { refreshSubscriptionStatus } = useSubscription();
  const reportRef = useRef(null);
  const hasResult = Boolean(result) && !isLoading;

  // A finished run changed the usage count; move focus to the report so
  // keyboard and screen reader users land on it.
  useEffect(() => {
    if (!hasResult) return;
    refreshSubscriptionStatus?.();
    reportRef.current?.focus({ preventScroll: true });
    reportRef.current?.scrollIntoView({ block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResult]);

  return (
    <>
      <Navbar />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:py-12">
        <header className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[60ch]">
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink md:text-4xl md:leading-[42px]">
              {title}
            </h1>
            <p className="mt-2 text-base leading-[26px] text-ink-2">{description}</p>
          </div>
          <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-3">
            <UsageLine featureType={featureType} />
            {hasResult && (
              <button type="button" onClick={onReset} className="btn btn-secondary">
                <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
                New analysis
              </button>
            )}
          </div>
        </header>

        {hasResult ? (
          <div ref={reportRef} tabIndex={-1} className="scroll-mt-24 pt-8 outline-none animate-fadeIn">
            {result}
            <AdWrapper>
              <ResultsAd className="mt-8" />
            </AdWrapper>
          </div>
        ) : (
          <div className="grid gap-6 pt-8 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">{input}</div>

            <div className="lg:col-span-7">
              {isLoading ? (
                progress
              ) : error ? (
                <div role="alert" className="panel border-l-[3px] border-l-critical p-6">
                  <h2 className="text-base font-semibold text-ink">Analysis failed</h2>
                  <p className="mt-1 text-[15px] leading-6 text-ink-2">{error}</p>
                  {onRetry && (
                    <button type="button" onClick={onRetry} className="btn btn-secondary mt-4">
                      Try again
                    </button>
                  )}
                </div>
              ) : (
                <div className="panel p-6 sm:p-8">
                  <h2 className="text-base font-semibold text-ink">Your report will include</h2>
                  <ul className="mt-4 divide-y divide-line">
                    {includes.map((item) => (
                      <li key={item.title} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                        <Check size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                        <div>
                          <p className="text-[15px] font-medium text-ink">{item.title}</p>
                          <p className="text-sm text-ink-3">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {children}
    </>
  );
}
