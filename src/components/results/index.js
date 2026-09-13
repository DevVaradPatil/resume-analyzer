"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { getScoreColor, getScoreLabel, getScoreTextColor, toScore } from "../../lib/score";

/**
 * Shared primitives for the three analysis reports (DESIGN.md 5.6 and 9.2).
 *
 * Everything here is defensive about its input: the reports render model
 * output, and a response missing one nested key used to throw and blank the
 * whole results tree (IMPROVEMENT_PLAN item 14). Each primitive renders
 * nothing for missing or wrongly-typed data instead.
 */

export const asArray = (value) => (Array.isArray(value) ? value : []);

export const asObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : null;

/** "work_experience" -> "Work experience" */
export const humanize = (key) => {
  const text = String(key).replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const isPrintable = (value) => typeof value === "string" || typeof value === "number";

/**
 * The large score block: numeral, "/100", band label, 4px bar.
 */
export function ScoreDisplay({ score, kind = "quality", caption }) {
  const value = toScore(score);
  if (value === null) return null;
  const label = getScoreLabel(value, kind);

  return (
    <div>
      {caption && <p className="text-[13px] font-medium text-ink-3">{caption}</p>}
      <p className="mt-1 flex items-baseline gap-1">
        <span aria-hidden="true" className="text-[64px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
          {value}
        </span>
        <span aria-hidden="true" className="text-xl text-ink-3">/100</span>
        <span className="sr-only">{value} out of 100, {label}</span>
      </p>
      <p aria-hidden="true" className={`mt-2 text-sm font-medium ${getScoreTextColor(value)}`}>
        {label}
      </p>
      <div aria-hidden="true" className="mt-3 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-sunken">
        <div className={`h-full rounded-full ${getScoreColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * Compact labelled metric: label and numeral on one line, 4px bar beneath.
 */
export function ScoreBar({ label, score, kind = "quality", className = "" }) {
  const value = toScore(score);
  if (value === null) return null;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-medium text-ink">{label}</span>
        <span className="text-[15px] font-semibold text-ink tabular-nums">
          {value}
          <span className="text-[13px] font-normal text-ink-3">/100</span>
        </span>
      </div>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={`${label}: ${value} out of 100, ${getScoreLabel(value, kind)}`}
      >
        <div className={`h-full rounded-full ${getScoreColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * One report section. The id is the target of the in-page index.
 */
export function ReportPanel({ id, title, action, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="panel scroll-mt-24 p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SubHeading({ children }) {
  return <h3 className="mb-3 text-sm font-semibold text-ink">{children}</h3>;
}

const DOT_TONES = {
  positive: "bg-positive",
  warning: "bg-caution",
  neutral: "bg-line-strong",
};

export function BulletList({ items, tone = "neutral", render = (item) => item, className = "" }) {
  const list = asArray(items).filter(isPrintable);
  if (list.length === 0) return null;

  return (
    <ul className={`space-y-2.5 ${className}`}>
      {list.map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-[15px] leading-6 text-ink-2">
          <span
            aria-hidden="true"
            className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONES[tone] || DOT_TONES.neutral}`}
          />
          <span>{render(item)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Keywords and skills: literal strings a user might copy, so Geist Mono.
 * Missing ones carry a 10% critical tint.
 */
export function KeywordList({ items, missing = false }) {
  const list = asArray(items).filter(isPrintable);
  if (list.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <li
          key={index}
          className={`inline-flex min-h-7 items-center rounded-full px-3 py-0.5 font-mono text-[13px] ${
            missing ? "bg-critical/10 text-critical" : "bg-sunken text-ink-2"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

const PRIORITY_STYLES = {
  high: "bg-critical/10 text-critical",
  medium: "bg-caution/10 text-caution",
};

export function PriorityBadge({ priority }) {
  if (!isPrintable(priority)) return null;
  const style = PRIORITY_STYLES[String(priority).toLowerCase()] || "bg-sunken text-ink-2";

  return (
    <span className={`inline-flex h-[22px] shrink-0 items-center rounded-full px-2.5 text-xs font-medium ${style}`}>
      {priority}
    </span>
  );
}

/**
 * Sub-scores of one metric group as a quiet two-column list.
 */
export function KeyValueList({ data }) {
  const entries = Object.entries(asObject(data) || {}).filter(([, value]) => isPrintable(value));
  if (entries.length === 0) return null;

  return (
    <dl className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-4 text-sm">
          <dt className="text-ink-3">{humanize(key)}</dt>
          <dd className="text-ink-2 tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Two-to-five small stats in a row, e.g. grade and ATS readiness.
 * Items with no value are dropped rather than shown as zero.
 */
export function StatList({ items }) {
  const list = items.filter((item) => isPrintable(item.value) && item.value !== "");
  if (list.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {list.map((item) => (
        <div key={item.label}>
          <dt className="text-[13px] text-ink-3">{item.label}</dt>
          <dd className="mt-0.5 text-lg font-semibold tracking-tight text-ink tabular-nums">
            {item.value}
            {item.suffix && <span className="text-sm font-normal text-ink-3">{item.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Report frame: sticky section index on desktop, sections beside it.
 *
 * @param {Array<{id: string, label: string}>} sections - only those rendered
 */
export function ReportLayout({ sections, children }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[176px_minmax(0,1fr)]">
      <nav aria-label="Report sections" className="hidden lg:block">
        <ul className="sticky top-24 space-y-1 border-l border-line">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-ink-3 transition-colors hover:border-line-strong hover:text-ink"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 space-y-6">{children}</div>
    </div>
  );
}

/**
 * Copies text and confirms with a check for 2 seconds.
 */
export function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  if (typeof text !== "string" || !text) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions); the text is
      // still selectable on screen, so there is nothing useful to show.
    }
  };

  return (
    <button type="button" onClick={copy} className="btn btn-secondary h-8 px-3 text-sm">
      {copied ? (
        <Check size={16} strokeWidth={1.75} className="text-positive" aria-hidden="true" />
      ) : (
        <Copy size={16} strokeWidth={1.75} aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
