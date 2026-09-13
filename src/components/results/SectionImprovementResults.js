"use client";

import React from "react";
import {
  asArray,
  asObject,
  BulletList,
  CopyButton,
  KeywordList,
  ReportLayout,
  ReportPanel,
  ScoreBar,
  ScoreDisplay,
  SubHeading,
} from "./index";

const PLACEHOLDER = /(\[[^\]\n]+\])/g;

/** Marks "[X%]"-style placeholders the model leaves for the user's real figures. */
function markPlaceholders(text, keyPrefix) {
  return text.split(PLACEHOLDER).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${keyPrefix}-${index}`} className="rounded-[4px] bg-caution/10 px-1 text-caution">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Renders markdown-style bold (**text**) as <strong>, and highlights
 * placeholders. The model uses both in the rewrite and the feedback lines.
 */
function parseMarkdownText(text) {
  if (typeof text !== "string") return text;

  return text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-ink">
        {markPlaceholders(part.slice(2, -2), index)}
      </strong>
    ) : (
      <React.Fragment key={index}>{markPlaceholders(part, index)}</React.Fragment>
    )
  );
}

/** Copy the rewrite without the ** markers the screen turns into bold. */
const plain = (text) => (typeof text === "string" ? text.replace(/\*\*(.*?)\*\*/g, "$1") : "");

/**
 * Section improvement report. Reads the keys defined by the prompt template in
 * improveResumeSectionWithGemini; that template is the contract.
 *
 * @param {Object} props
 * @param {Object} props.data - Parsed improvement result from the API
 * @param {string} [props.original] - The text the user submitted
 */
export default function SectionImprovementResults({ data, original }) {
  if (!asObject(data)) return null;

  const analysis = asObject(data.analysis) || {};
  const changes = asArray(analysis.improvements_made).filter(asObject);
  const ats = asObject(data.ats_optimization);
  const alternatives = asArray(data.alternatives).filter((alt) => asObject(alt) && typeof alt.text === "string");
  const hasTips = asArray(data.tips).length > 0 || asArray(data.formatting_suggestions).length > 0;
  const hasFeedback =
    asArray(data.key_improvements).length > 0 ||
    asArray(analysis.original_strengths).length > 0 ||
    asArray(analysis.original_weaknesses).length > 0 ||
    changes.length > 0 ||
    data.improvement_score != null;

  const hasPlaceholders = [data.improved_text, ...alternatives.map((alt) => alt.text)].some(
    (text) => typeof text === "string" && /\[[^\]\n]+\]/.test(text)
  );

  const sections = [
    { id: "rewrite", label: "Rewrite" },
    hasFeedback && { id: "changes", label: "Changes" },
    ats && { id: "ats", label: "ATS" },
    alternatives.length > 0 && { id: "alternatives", label: "Alternatives" },
    hasTips && { id: "tips", label: "Tips" },
  ].filter(Boolean);

  return (
    <ReportLayout sections={sections}>
      <ReportPanel id="rewrite" title="Rewrite" action={<CopyButton text={plain(data.improved_text)} />}>
        {hasPlaceholders && (
          <p className="mb-5 text-[15px] text-ink-2">
            Replace the <mark className="rounded-[4px] bg-caution/10 px-1 text-caution">[highlighted]</mark> placeholders with your real figures, or delete them before you use this text.
          </p>
        )}
        <div className={`grid gap-6 ${original ? "lg:grid-cols-2" : ""}`}>
          {original && (
            <div>
              <SubHeading>Original</SubHeading>
              <div className="whitespace-pre-wrap rounded-control bg-sunken p-4 text-[15px] leading-6 text-ink-3">
                {original}
              </div>
            </div>
          )}
          <div>
            <SubHeading>Improved</SubHeading>
            <div className="whitespace-pre-wrap rounded-control p-4 text-[15px] leading-6 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
              {parseMarkdownText(data.improved_text)}
            </div>
          </div>
        </div>
      </ReportPanel>

      {hasFeedback && (
        <ReportPanel id="changes" title="What changed">
          <div className="grid gap-8 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
            <ScoreDisplay score={data.improvement_score} kind="quality" caption="Improvement score" />
            {asArray(data.key_improvements).length > 0 && (
              <div>
                <SubHeading>Key improvements</SubHeading>
                <BulletList items={data.key_improvements} tone="positive" render={parseMarkdownText} />
              </div>
            )}
          </div>

          {changes.length > 0 && (
            <ul className="mt-8 divide-y divide-line border-t border-line">
              {changes.map((change, index) => (
                <li key={index} className="py-4 last:pb-0">
                  {change.category && <span className="badge mb-2">{change.category}</span>}
                  <p className="text-[15px] leading-6 text-ink">{parseMarkdownText(change.change)}</p>
                  {change.reason && (
                    <p className="mt-1 text-sm text-ink-3">{parseMarkdownText(change.reason)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 grid gap-8 border-t border-line pt-6 empty:hidden md:grid-cols-2">
            {asArray(analysis.original_strengths).length > 0 && (
              <div>
                <SubHeading>Already working in the original</SubHeading>
                <BulletList items={analysis.original_strengths} tone="positive" render={parseMarkdownText} />
              </div>
            )}
            {asArray(analysis.original_weaknesses).length > 0 && (
              <div>
                <SubHeading>Weak spots in the original</SubHeading>
                <BulletList items={analysis.original_weaknesses} tone="warning" render={parseMarkdownText} />
              </div>
            )}
          </div>
        </ReportPanel>
      )}

      {ats && (
        <ReportPanel id="ats" title="ATS optimisation">
          <div className="grid gap-6 sm:grid-cols-2">
            <ScoreBar label="Keyword density" score={ats.keyword_density} />
            <ScoreBar label="Format score" score={ats.formatting_score} />
          </div>
          {asArray(ats.suggested_keywords).length > 0 && (
            <div className="mt-8">
              <SubHeading>Keywords to consider adding</SubHeading>
              <KeywordList items={ats.suggested_keywords} />
            </div>
          )}
        </ReportPanel>
      )}

      {alternatives.length > 0 && (
        <ReportPanel id="alternatives" title="Alternative versions">
          <ul className="divide-y divide-line">
            {alternatives.map((alt, index) => (
              <li key={index} className="py-5 first:pt-0 last:pb-0">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-medium text-ink">{alt.version || `Version ${index + 1}`}</h3>
                  <CopyButton text={plain(alt.text)} />
                </div>
                <div className="whitespace-pre-wrap text-[15px] leading-6 text-ink-2">
                  {parseMarkdownText(alt.text)}
                </div>
              </li>
            ))}
          </ul>
        </ReportPanel>
      )}

      {hasTips && (
        <ReportPanel id="tips" title="Tips">
          <div className="grid gap-8 md:grid-cols-2">
            {asArray(data.tips).length > 0 && (
              <div>
                <SubHeading>Writing</SubHeading>
                <BulletList items={data.tips} render={parseMarkdownText} />
              </div>
            )}
            {asArray(data.formatting_suggestions).length > 0 && (
              <div>
                <SubHeading>Formatting</SubHeading>
                <BulletList items={data.formatting_suggestions} render={parseMarkdownText} />
              </div>
            )}
          </div>
        </ReportPanel>
      )}
    </ReportLayout>
  );
}
