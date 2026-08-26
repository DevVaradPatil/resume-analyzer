"use client";

import React from "react";
import { getScoreColor, getScoreLabel } from "../../lib/score";

/**
 * Shared presentational primitives for analysis results.
 *
 * The three feature pages each rendered their own copy of these patterns. The
 * pieces here are the ones that were genuinely identical; page-specific layout
 * deliberately stays in the pages rather than being forced through props.
 */

/**
 * The white rounded panel every result section sits in.
 */
export function ResultCard({ title, icon: Icon, iconColor = "text-slate-600", action, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          {title && (
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {Icon && <Icon className={iconColor} size={20} aria-hidden="true" />}
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Dot-prefixed list. `tone` picks the dot colour by meaning rather than by
 * class name, so callers do not repeat Tailwind colours.
 */
const DOT_TONES = {
  positive: "bg-green-500",
  negative: "bg-red-500",
  warning: "bg-amber-500",
  neutral: "bg-blue-500",
};

export function BulletList({ items, tone = "neutral", size = "base", className = "" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const textClass = size === "sm" ? "text-sm text-slate-600" : "text-slate-600";
  const spacing = size === "sm" ? "space-y-1" : "space-y-2";

  return (
    <ul className={`${spacing} ${className}`}>
      {items.map((item, index) => (
        <li key={index} className={`flex items-start gap-3 ${textClass}`}>
          <span
            className={`w-2 h-2 ${DOT_TONES[tone] || DOT_TONES.neutral} rounded-full mt-2 flex-shrink-0`}
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Labelled progress bar for a 0-100 metric.
 *
 * Carries proper progressbar semantics, including the band label, so the value
 * is announced rather than being conveyed by colour alone.
 */
export function ScoreBar({ label, score, showValue = true, className = "" }) {
  const value = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-slate-800">{value}%</span>
          )}
        </div>
      )}
      <div
        className="w-full bg-slate-200 rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={label ? `${label}: ${value} out of 100, ${getScoreLabel(value)}` : undefined}
      >
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Large circular score badge.
 */
export function ScoreCircle({ score, caption, size = "lg" }) {
  const value = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;
  const dimension = size === "sm" ? "w-16 h-16 text-xl" : "w-24 h-24 text-3xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${dimension} ${getScoreColor(value)} rounded-full flex items-center justify-center text-white font-bold`}
      >
        <span aria-hidden="true">{value}</span>
        <span className="sr-only">
          {value} out of 100, {getScoreLabel(value)}
        </span>
      </div>
      {caption && <span className="text-sm text-slate-600">{caption}</span>}
    </div>
  );
}
