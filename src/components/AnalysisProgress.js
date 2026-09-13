"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * Progress display for the long-running AI calls.
 *
 * These take roughly 10-30 seconds, and previously showed a bare spinner with
 * a static list of bullet points -- giving the user no sense of whether
 * anything was happening or how much longer it would take.
 *
 * The stages advance on a timer rather than from real server progress: the API
 * is a single request that returns only when it is finished, so there is no
 * incremental signal to report. The timings are therefore an honest estimate,
 * not a measurement, and the last stage holds until the request actually
 * resolves so the UI never claims to be done before it is.
 *
 * @param {Array<{label: string, seconds: number}>} stages - Ordered stages
 * @param {string} title - Heading text
 */
export default function AnalysisProgress({ stages, title = "Analyzing" }) {
  const [activeStage, setActiveStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Schedule one transition per stage boundary, at the cumulative offset.
    let cumulative = 0;
    const timers = stages.slice(0, -1).map((stage, index) => {
      cumulative += stage.seconds;
      return setTimeout(() => setActiveStage(index + 1), cumulative * 1000);
    });

    const ticker = setInterval(() => setElapsed((e) => e + 1), 1000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(ticker);
    };
  }, [stages]);

  const totalSeconds = stages.reduce((sum, s) => sum + s.seconds, 0);
  // Cap the bar just short of full: the work is not finished until the request
  // returns, and a bar sitting at 100% while the user waits reads as a hang.
  const percent = Math.min(95, Math.round((elapsed / totalSeconds) * 100));

  return (
    <div className="panel p-6 sm:p-8 animate-fadeIn">
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Stage list first in DOM so it sits above the skeleton on mobile. */}
        <div className="lg:order-2">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-3">
            This usually takes {totalSeconds < 30 ? "under" : "about"}{" "}
            {totalSeconds < 30 ? 30 : totalSeconds} seconds.
          </p>

          <div
            className="mt-4 h-1 w-full overflow-hidden rounded-full bg-sunken"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Analysis progress"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* aria-live announces each stage transition to screen readers. */}
          <ul className="mt-5 space-y-3 text-sm" aria-live="polite" aria-atomic="false">
            {stages.map((stage, index) => {
              const isDone = index < activeStage;
              const isActive = index === activeStage;

              return (
                <li
                  key={stage.label}
                  className={`flex items-center gap-3 transition-colors duration-300 ${
                    isActive ? "font-medium text-ink" : isDone ? "text-ink-2" : "text-ink-3"
                  }`}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {isDone ? (
                      <Check size={16} strokeWidth={1.75} className="text-positive" aria-hidden="true" />
                    ) : isActive ? (
                      <Loader2 size={14} strokeWidth={1.75} className="text-accent motion-safe:animate-spin" aria-hidden="true" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-line-strong" aria-hidden="true" />
                    )}
                  </span>
                  <span>{stage.label}</span>
                  {isDone && <span className="sr-only">complete</span>}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Skeleton shaped like the report that is about to appear. */}
        <div className="space-y-6 motion-safe:animate-pulse lg:order-1" aria-hidden="true">
          <div className="flex items-end gap-4">
            <div className="h-14 w-24 rounded-control bg-sunken" />
            <div className="mb-1 h-4 w-28 rounded-full bg-sunken" />
          </div>
          <div className="space-y-4 border-t border-line pt-6">
            {[72, 58, 84].map((width) => (
              <div key={width} className="flex items-center gap-4">
                <div className="h-3 w-32 shrink-0 rounded-full bg-sunken" />
                <div className="h-1 flex-1 rounded-full bg-sunken">
                  <div className="h-1 rounded-full bg-line-strong" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
            {[0, 1].map((column) => (
              <div key={column} className="space-y-3">
                <div className="h-4 w-24 rounded-full bg-sunken" />
                <div className="h-3 w-full rounded-full bg-sunken" />
                <div className="h-3 w-5/6 rounded-full bg-sunken" />
                <div className="h-3 w-2/3 rounded-full bg-sunken" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stage sets per feature. Seconds are rough estimates of relative duration --
 * the Gemini call dominates, so it gets the longest slice.
 */
export const JOB_MATCH_STAGES = [
  { label: "Reading your resume", seconds: 3 },
  { label: "Extracting skills and experience", seconds: 5 },
  { label: "Comparing against the job description", seconds: 9 },
  { label: "Checking ATS compatibility", seconds: 7 },
  { label: "Writing your recommendations", seconds: 8 },
];

export const ANALYTICS_STAGES = [
  { label: "Reading your resume", seconds: 3 },
  { label: "Assessing content quality", seconds: 7 },
  { label: "Evaluating structure and formatting", seconds: 7 },
  { label: "Benchmarking market competitiveness", seconds: 8 },
  { label: "Generating industry insights", seconds: 7 },
];

export const SECTION_IMPROVEMENT_STAGES = [
  { label: "Reading your section", seconds: 3 },
  { label: "Identifying weak phrasing", seconds: 6 },
  { label: "Rewriting for impact", seconds: 8 },
  { label: "Adding measurable results", seconds: 6 },
];
