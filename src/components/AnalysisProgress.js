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
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 animate-fadeIn">
      <div className="flex flex-col items-center gap-5">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

        <div className="text-center">
          <h3 className="text-blue-800 font-semibold text-lg">{title}</h3>
          <p className="text-blue-700 text-sm mt-1">
            This usually takes {totalSeconds < 30 ? "under" : "about"}{" "}
            {totalSeconds < 30 ? 30 : totalSeconds} seconds.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div
            className="h-2 w-full bg-blue-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Analysis progress"
          >
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Stage list. aria-live announces each transition to screen readers. */}
        <ul
          className="w-full max-w-md space-y-2 text-sm"
          aria-live="polite"
          aria-atomic="false"
        >
          {stages.map((stage, index) => {
            const isDone = index < activeStage;
            const isActive = index === activeStage;

            return (
              <li
                key={stage.label}
                className={`flex items-center gap-3 transition-colors duration-300 ${
                  isDone
                    ? "text-blue-500"
                    : isActive
                    ? "text-blue-900 font-medium"
                    : "text-blue-400"
                }`}
              >
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  {isDone ? (
                    <Check size={16} aria-hidden="true" />
                  ) : isActive ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-current opacity-50"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span>{stage.label}</span>
                {isDone && <span className="sr-only">complete</span>}
              </li>
            );
          })}
        </ul>
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
