"use client";

import React from "react";
import { BulletList } from "./index";
import { getScoreColor } from "../../lib/score";

/**
 * Result rendering for the jobmatch feature.
 *
 * Extracted verbatim from the page component, which had grown past 600 lines
 * with all of this inline. It is a pure function of `data` -- it closed over no
 * page state -- so moving it changes nothing about behaviour.
 *
 * @param {Object} props
 * @param {Object} props.data - Parsed analysis result from the API
 */
export default function JobMatchResults({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Job Match Analysis Summary</h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{data.score}/100</div>
            <div className="text-sm text-slate-600">Match Score</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{data.summary_insights?.overall_grade || 'N/A'}</div>
            <div className="text-sm text-blue-600">Grade</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="text-2xl font-bold text-emerald-700">{data.summary_insights?.ats_readiness || 0}%</div>
            <div className="text-sm text-emerald-600">ATS Ready</div>
          </div>
          <div className="text-center p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{data.summary_insights?.competitiveness || 0}%</div>
            <div className="text-sm text-purple-600">Competitive</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="text-2xl font-bold text-indigo-700">{data.score || 0}%</div>
            <div className="text-sm text-indigo-600">Job Match</div>
          </div>
        </div>
        
        {/* Experience Level Comparison */}
        {data.summary_insights?.experience_level && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2">Experience Level Analysis</h3>
            <div className="flex flex-wrap gap-8">
              <div className="text-center">
                <div className="text-sm text-amber-600">Resume Level</div>
                <div className="text-xl font-bold text-amber-700">{data.summary_insights.experience_level.resume_level || 'N/A'}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-amber-600">Job Level</div>
                <div className="text-xl font-bold text-amber-700">{data.summary_insights.experience_level.job_level || 'N/A'}</div>
              </div>
              <div className="flex-grow">
                <div className="text-sm text-amber-600">Match Status</div>
                <div className={`text-lg font-bold ${data.summary_insights.experience_level.match ? 'text-green-600' : 'text-red-600'}`}>
                  {data.summary_insights.experience_level.match ? 'Levels Match' : 'Levels Mismatch'}
                </div>
                {!data.summary_insights.experience_level.match && (
                  <div className="text-sm mt-1 text-slate-600">{data.summary_insights.experience_level.mismatch_details}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Strengths */}
        {data.summary_insights?.top_strengths && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Top Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {data.summary_insights.top_strengths.map((strength, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 border border-green-200 text-green-800 rounded-full text-sm">
                  {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Priority Actions */}
        {data.summary_insights?.priority_actions && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Priority Actions</h3>
            <div className="space-y-2">
              {data.summary_insights.priority_actions.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${
                    item.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                    item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {item.priority}
                  </span>
                  <div>
                    <div className="font-medium text-slate-800">{item.area}</div>
                    <div className="text-sm text-slate-600">{item.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Analysis */}
      {data.comprehensive_analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Detailed Metrics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {data.comprehensive_analysis.detailed_metrics && Object.entries(data.comprehensive_analysis.detailed_metrics).map(([category, categoryData]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-slate-800 capitalize">
                  {category.replace(/_/g, ' ')}
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Score</span>
                    <span className="font-bold text-slate-800">{categoryData.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(categoryData.score)}`}
                      style={{ width: `${categoryData.score}%` }}
                    ></div>
                  </div>
                  {categoryData.details && (
                    <div className="mt-3 space-y-1">
                      {Object.entries(categoryData.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {data.comprehensive_analysis.strengths && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Strengths</h3>
                <BulletList
                  items={data.comprehensive_analysis.strengths}
                  tone="positive"
                  size="sm"
                />
              </div>
            )}

            {data.comprehensive_analysis.weaknesses && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Areas for Improvement</h3>
                <BulletList
                  items={data.comprehensive_analysis.weaknesses}
                  tone="warning"
                  size="sm"
                />
              </div>
            )}
          </div>

          {/* Improvement Suggestions */}
          {data.comprehensive_analysis.improvement_suggestions && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-2">Improvement Suggestions</h3>
              <ul className="space-y-1">
                {data.comprehensive_analysis.improvement_suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-slate-600">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ATS Analysis */}
      {data.ats_analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">ATS Compatibility Analysis</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600">ATS Score</span>
            <span className="text-2xl font-bold text-blue-600">{data.ats_analysis.score}/100</span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {data.ats_analysis.format_issues && (
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Format Issues</h3>
                <ul className="space-y-1">
                  {data.ats_analysis.format_issues.map((issue, index) => (
                    <li key={index} className="text-sm text-slate-600">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.ats_analysis.keyword_match && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Keyword Match ({data.ats_analysis.keyword_match.percentage}%)</h3>
                <div className="space-y-2">
                  {data.ats_analysis.keyword_match.matches && data.ats_analysis.keyword_match.matches.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-green-700">Matched:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.ats_analysis.keyword_match.matches.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 border border-green-200 text-green-800 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.ats_analysis.keyword_match.missing && data.ats_analysis.keyword_match.missing.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-red-700">Missing:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.ats_analysis.keyword_match.missing.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 border border-red-200 text-red-800 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {data.ats_analysis.recommendations && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {data.ats_analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-slate-600">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Analysis */}
      {data.skills_analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Skills Analysis</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.skills_analysis.matching_skills && (
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Matching Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills_analysis.matching_skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 border border-green-200 text-green-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {data.skills_analysis.missing_skills && (
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills_analysis.missing_skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 border border-red-200 text-red-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {data.skills_analysis.additional_skills && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Additional Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills_analysis.additional_skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Feedback */}
      {data.section_feedback && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Section-by-Section Feedback</h2>
          <div className="space-y-4">
            {Object.entries(data.section_feedback).map(([section, feedback]) => (
              <div key={section} className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 capitalize mb-2">
                  {section.replace(/_/g, ' ')}
                </h3>
                <p className="text-sm text-slate-600">{feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      {data.gap_analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Gap Analysis & Learning Paths</h2>
          
          {data.gap_analysis.identified_gaps && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-800 mb-2">Identified Gaps</h3>
              <div className="flex flex-wrap gap-2">
                {data.gap_analysis.identified_gaps.map((gap, index) => (
                  <span key={index} className="px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-full text-sm">
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.gap_analysis.learning_paths && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Learning Recommendations</h3>
              <div className="space-y-3">
                {data.gap_analysis.learning_paths.map((path, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                    <h4 className="font-medium text-slate-800">{path.gap}</h4>
                    <ul className="mt-1 space-y-1">
                      {path.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="text-sm text-slate-600">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Industry Insights */}
      {data.industry_insights && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Industry Insights</h2>
          
          {data.industry_insights.industry_trends && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-800 mb-2">Current Industry Trends</h3>
              <div className="flex flex-wrap gap-2">
                {data.industry_insights.industry_trends.map((trend, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-sm">
                    {trend}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {data.industry_insights.recommendations && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Industry Recommendations</h3>
              <ul className="space-y-1">
                {data.industry_insights.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-slate-600">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
