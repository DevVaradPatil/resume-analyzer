"use client";

import React from "react";
import {
  asArray,
  asObject,
  humanize,
  BulletList,
  KeyValueList,
  KeywordList,
  PriorityBadge,
  ReportLayout,
  ReportPanel,
  ScoreBar,
  ScoreDisplay,
  StatList,
  SubHeading,
} from "./index";

/**
 * Job match report. Reads the keys defined by the prompt template in
 * analyzeResumeWithGemini; that template is the contract.
 *
 * @param {Object} props
 * @param {Object} props.data - Parsed analysis result from the API
 */
export default function JobMatchResults({ data }) {
  if (!asObject(data)) return null;

  const insights = asObject(data.summary_insights) || {};
  const level = asObject(insights.experience_level);
  const priorityActions = asArray(insights.priority_actions).filter(asObject);

  const comprehensive = asObject(data.comprehensive_analysis);
  const metrics = Object.entries(asObject(comprehensive?.detailed_metrics) || {}).filter(([, m]) => asObject(m));
  const showMetrics =
    metrics.length > 0 ||
    ["strengths", "weaknesses", "improvement_suggestions"].some((key) => asArray(comprehensive?.[key]).length > 0);

  const ats = asObject(data.ats_analysis);
  const keywords = asObject(ats?.keyword_match) || {};
  const skills = asObject(data.skills_analysis);
  const sectionFeedback = Object.entries(asObject(data.section_feedback) || {}).filter(
    ([, text]) => typeof text === "string" && text
  );
  const gaps = asObject(data.gap_analysis);
  const learningPaths = asArray(gaps?.learning_paths).filter(asObject);
  const industry = asObject(data.industry_insights);

  const sections = [
    { id: "summary", label: "Summary" },
    showMetrics && { id: "metrics", label: "Metrics" },
    ats && { id: "keywords", label: "Keywords" },
    skills && { id: "skills", label: "Skills" },
    sectionFeedback.length > 0 && { id: "sections", label: "Sections" },
    gaps && { id: "gaps", label: "Gaps" },
    industry && { id: "industry", label: "Industry" },
  ].filter(Boolean);

  return (
    <ReportLayout sections={sections}>
      <ReportPanel id="summary" title="Job match report">
        <div className="grid gap-8 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <ScoreDisplay score={data.score} kind="match" caption="Match score" />

          <div className="space-y-6">
            <StatList
              items={[
                { label: "Grade", value: insights.overall_grade },
                { label: "ATS readiness", value: insights.ats_readiness, suffix: "/100" },
                { label: "Competitiveness", value: insights.competitiveness, suffix: "/100" },
              ]}
            />

            {level && (level.resume_level || level.job_level) && (
              <div className="text-[15px] leading-6">
                <p className="text-ink-2">
                  Your resume reads as <span className="font-medium text-ink">{level.resume_level || "unclear"}</span>.
                  The role asks for <span className="font-medium text-ink">{level.job_level || "an unstated level"}</span>.
                </p>
                {level.match === false && level.mismatch_details && (
                  <p className="mt-1 text-caution">{level.mismatch_details}</p>
                )}
              </div>
            )}

            {asArray(insights.top_strengths).length > 0 && (
              <div>
                <SubHeading>Top strengths</SubHeading>
                <BulletList items={insights.top_strengths} tone="positive" />
              </div>
            )}
          </div>
        </div>

        {priorityActions.length > 0 && (
          <div className="mt-8 border-t border-line pt-6">
            <SubHeading>Do these first</SubHeading>
            <ul className="divide-y divide-line">
              {priorityActions.map((item, index) => (
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

      {showMetrics && (
        <ReportPanel id="metrics" title="Detailed metrics">
          {metrics.length > 0 && (
            <div className="divide-y divide-line">
              {metrics.map(([category, metric]) => (
                <div key={category} className="py-5 first:pt-0">
                  <ScoreBar label={humanize(category)} score={metric.score} />
                  <KeyValueList data={metric.details} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 grid gap-8 border-t border-line pt-6 empty:hidden md:grid-cols-2">
            {asArray(comprehensive.strengths).length > 0 && (
              <div>
                <SubHeading>Strengths</SubHeading>
                <BulletList items={comprehensive.strengths} tone="positive" />
              </div>
            )}
            {asArray(comprehensive.weaknesses).length > 0 && (
              <div>
                <SubHeading>Weaknesses</SubHeading>
                <BulletList items={comprehensive.weaknesses} tone="warning" />
              </div>
            )}
            {asArray(comprehensive.improvement_suggestions).length > 0 && (
              <div className="md:col-span-2">
                <SubHeading>Suggestions</SubHeading>
                <BulletList items={comprehensive.improvement_suggestions} />
              </div>
            )}
          </div>
        </ReportPanel>
      )}

      {ats && (
        <ReportPanel id="keywords" title="ATS and keywords">
          <div className="grid gap-6 sm:grid-cols-2">
            <ScoreBar label="ATS score" score={ats.score} />
            <ScoreBar label="Keyword match" score={keywords.percentage} />
          </div>

          <div className="mt-8 space-y-6 empty:hidden">
            {asArray(keywords.missing).length > 0 && (
              <div>
                <SubHeading>Missing from your resume</SubHeading>
                <KeywordList items={keywords.missing} missing />
              </div>
            )}
            {asArray(keywords.matches).length > 0 && (
              <div>
                <SubHeading>Matched</SubHeading>
                <KeywordList items={keywords.matches} />
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-8 border-t border-line pt-6 empty:hidden md:grid-cols-2">
            {asArray(ats.format_issues).length > 0 && (
              <div>
                <SubHeading>Format issues</SubHeading>
                <BulletList items={ats.format_issues} tone="warning" />
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

      {skills && (
        <ReportPanel id="skills" title="Skills">
          <div className="space-y-6">
            {asArray(skills.missing_skills).length > 0 && (
              <div>
                <SubHeading>Required by the role, missing from your resume</SubHeading>
                <KeywordList items={skills.missing_skills} missing />
              </div>
            )}
            {asArray(skills.matching_skills).length > 0 && (
              <div>
                <SubHeading>Matching</SubHeading>
                <KeywordList items={skills.matching_skills} />
              </div>
            )}
            {asArray(skills.additional_skills).length > 0 && (
              <div>
                <SubHeading>Extra skills you bring</SubHeading>
                <KeywordList items={skills.additional_skills} />
              </div>
            )}
          </div>
        </ReportPanel>
      )}

      {sectionFeedback.length > 0 && (
        <ReportPanel id="sections" title="Section feedback">
          <dl className="divide-y divide-line">
            {sectionFeedback.map(([section, text]) => (
              <div key={section} className="grid gap-1 py-4 first:pt-0 last:pb-0 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
                <dt className="text-[15px] font-medium text-ink">{humanize(section)}</dt>
                <dd className="text-[15px] leading-6 text-ink-2">{text}</dd>
              </div>
            ))}
          </dl>
        </ReportPanel>
      )}

      {gaps && (
        <ReportPanel id="gaps" title="Gaps and what to learn">
          {asArray(gaps.identified_gaps).length > 0 && (
            <div className="mb-6">
              <SubHeading>Gaps</SubHeading>
              <BulletList items={gaps.identified_gaps} tone="warning" />
            </div>
          )}
          {learningPaths.length > 0 && (
            <ul className="divide-y divide-line border-t border-line">
              {learningPaths.map((path, index) => (
                <li key={index} className="py-4 last:pb-0">
                  <p className="mb-2 text-[15px] font-medium text-ink">{path.gap}</p>
                  <BulletList items={path.recommendations} />
                </li>
              ))}
            </ul>
          )}
        </ReportPanel>
      )}

      {industry && (
        <ReportPanel id="industry" title="Industry context">
          <div className="grid gap-8 md:grid-cols-2">
            {asArray(industry.industry_trends).length > 0 && (
              <div>
                <SubHeading>Trends</SubHeading>
                <BulletList items={industry.industry_trends} />
              </div>
            )}
            {asArray(industry.recommendations).length > 0 && (
              <div>
                <SubHeading>Recommendations</SubHeading>
                <BulletList items={industry.recommendations} />
              </div>
            )}
          </div>
        </ReportPanel>
      )}
    </ReportLayout>
  );
}
