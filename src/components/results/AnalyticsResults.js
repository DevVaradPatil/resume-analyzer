"use client";

import React from "react";
import {
  asArray,
  asObject,
  humanize,
  BulletList,
  KeyValueList,
  PriorityBadge,
  ReportLayout,
  ReportPanel,
  ScoreBar,
  ScoreDisplay,
  StatList,
  SubHeading,
} from "./index";

/**
 * Resume analytics report. Reads the keys defined by the prompt template in
 * analyzeResumeOverallWithGemini; that template is the contract.
 *
 * @param {Object} props
 * @param {Object} props.data - Parsed analysis result from the API
 */
export default function AnalyticsResults({ data }) {
  if (!asObject(data)) return null;

  const insights = asObject(data.summary_insights) || {};
  const priorities = asArray(insights.priority_improvements).filter(asObject);
  const metrics = Object.entries(asObject(data.detailed_analysis) || {}).filter(([, m]) => asObject(m));
  const sectionScores = Object.entries(asObject(data.section_analysis) || {}).filter(([, s]) => asObject(s));
  const hasStrengths = asArray(data.strengths).length > 0 || asArray(data.improvement_areas).length > 0;
  const ats = asObject(data.ats_analysis);
  const actions = asArray(data.actionable_recommendations).filter(asObject);
  const industry = asObject(data.industry_insights);

  const sections = [
    { id: "summary", label: "Summary" },
    metrics.length > 0 && { id: "metrics", label: "Metrics" },
    sectionScores.length > 0 && { id: "sections", label: "Sections" },
    hasStrengths && { id: "strengths", label: "Strengths" },
    ats && { id: "ats", label: "ATS" },
    actions.length > 0 && { id: "actions", label: "Actions" },
    industry && { id: "industry", label: "Industry" },
  ].filter(Boolean);

  return (
    <ReportLayout sections={sections}>
      <ReportPanel id="summary" title="Resume report">
        <div className="grid gap-8 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <ScoreDisplay score={data.overall_score} kind="quality" caption="Overall score" />

          <div className="space-y-6">
            <StatList
              items={[
                { label: "Grade", value: insights.overall_grade },
                { label: "ATS readiness", value: insights.ats_readiness, suffix: "/100" },
                { label: "Competitiveness", value: insights.market_competitiveness, suffix: "/100" },
                { label: "Presentation", value: insights.professional_presentation, suffix: "/100" },
                { label: "Experience level", value: insights.experience_level },
              ]}
            />

            {asArray(insights.top_strengths).length > 0 && (
              <div>
                <SubHeading>Top strengths</SubHeading>
                <BulletList items={insights.top_strengths} tone="positive" />
              </div>
            )}
          </div>
        </div>

        {priorities.length > 0 && (
          <div className="mt-8 border-t border-line pt-6">
            <SubHeading>Do these first</SubHeading>
            <ul className="divide-y divide-line">
              {priorities.map((item, index) => (
                <li key={index} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <PriorityBadge priority={item.priority} />
                  <div className="min-w-0 text-[15px] leading-6">
                    <p className="font-medium text-ink">{item.area}</p>
                    <p className="text-ink-2">{item.recommendation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ReportPanel>

      {metrics.length > 0 && (
        <ReportPanel id="metrics" title="Detailed metrics">
          <div className="divide-y divide-line">
            {metrics.map(([category, metric]) => (
              <div key={category} className="py-5 first:pt-0 last:pb-0">
                <ScoreBar label={humanize(category)} score={metric.score} />
                <KeyValueList data={metric.details} />
              </div>
            ))}
          </div>
        </ReportPanel>
      )}

      {sectionScores.length > 0 && (
        <ReportPanel id="sections" title="Section by section">
          <div className="divide-y divide-line">
            {sectionScores.map(([section, detail]) => (
              <div key={section} className="py-5 first:pt-0 last:pb-0">
                <ScoreBar label={humanize(section)} score={detail.score} />
                {typeof detail.feedback === "string" && (
                  <p className="mt-3 text-[15px] leading-6 text-ink-2">{detail.feedback}</p>
                )}
                <BulletList items={detail.suggestions} className="mt-3" />
              </div>
            ))}
          </div>
        </ReportPanel>
      )}

      {hasStrengths && (
        <ReportPanel id="strengths" title="Strengths and weak spots">
          <div className="grid gap-8 md:grid-cols-2">
            {asArray(data.strengths).length > 0 && (
              <div>
                <SubHeading>Strengths</SubHeading>
                <BulletList items={data.strengths} tone="positive" />
              </div>
            )}
            {asArray(data.improvement_areas).length > 0 && (
              <div>
                <SubHeading>To improve</SubHeading>
                <BulletList items={data.improvement_areas} tone="warning" />
              </div>
            )}
          </div>
        </ReportPanel>
      )}

      {ats && (
        <ReportPanel id="ats" title="ATS compatibility">
          <ScoreBar label="ATS score" score={ats.score} className="sm:max-w-[50%]" />
          <div className="mt-8 grid gap-8 empty:hidden md:grid-cols-3">
            {asArray(ats.strengths).length > 0 && (
              <div>
                <SubHeading>Working</SubHeading>
                <BulletList items={ats.strengths} tone="positive" />
              </div>
            )}
            {asArray(ats.issues).length > 0 && (
              <div>
                <SubHeading>Issues</SubHeading>
                <BulletList items={ats.issues} tone="warning" />
              </div>
            )}
            {asArray(ats.recommendations).length > 0 && (
              <div>
                <SubHeading>Recommendations</SubHeading>
                <BulletList items={ats.recommendations} />
              </div>
            )}
          </div>
        </ReportPanel>
      )}

      {actions.length > 0 && (
        <ReportPanel id="actions" title="Recommended actions">
          <ul className="divide-y divide-line">
            {actions.map((item, index) => (
              <li key={index} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-medium text-ink">{item.category}</span>
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="mt-1 text-[15px] leading-6 text-ink-2">{item.action}</p>
                {item.impact && <p className="mt-1 text-sm text-ink-3">{item.impact}</p>}
              </li>
            ))}
          </ul>
        </ReportPanel>
      )}

      {industry && (
        <ReportPanel id="industry" title="Industry context">
          {typeof industry.market_positioning === "string" && (
            <p className="mb-6 max-w-[65ch] text-[15px] leading-6 text-ink-2">{industry.market_positioning}</p>
          )}
          <div className="grid gap-8 empty:hidden md:grid-cols-2">
            {asArray(industry.current_trends).length > 0 && (
              <div>
                <SubHeading>Trends</SubHeading>
                <BulletList items={industry.current_trends} />
              </div>
            )}
            {asArray(industry.skill_recommendations).length > 0 && (
              <div>
                <SubHeading>Skills worth adding</SubHeading>
                <BulletList items={industry.skill_recommendations} />
              </div>
            )}
          </div>
        </ReportPanel>
      )}
    </ReportLayout>
  );
}
