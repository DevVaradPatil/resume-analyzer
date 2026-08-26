"use client";

import React from "react";
import { ResultCard, BulletList } from "./index";
import { getScoreColor } from "../../lib/score";

/**
 * Result rendering for the analytics feature.
 *
 * Extracted verbatim from the page component, which had grown past 600 lines
 * with all of this inline. It is a pure function of `data` -- it closed over no
 * page state -- so moving it changes nothing about behaviour.
 *
 * @param {Object} props
 * @param {Object} props.data - Parsed analysis result from the API
 */
export default function AnalyticsResults({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Resume Analysis Summary</h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{data.overall_score}/100</div>
            <div className="text-sm text-slate-600">Overall Score</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{data.summary_insights?.overall_grade || 'N/A'}</div>
            <div className="text-sm text-blue-600">Grade</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="text-2xl font-bold text-emerald-700">{data.summary_insights?.ats_readiness || 0}%</div>
            <div className="text-sm text-emerald-600">ATS Ready</div>
          </div>
          <div className="text-center p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{data.summary_insights?.market_competitiveness || 0}%</div>
            <div className="text-sm text-purple-600">Market Competitive</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <div className="text-2xl font-bold text-indigo-700">{data.summary_insights?.professional_presentation || 0}%</div>
            <div className="text-sm text-indigo-600">Professional</div>
          </div>
          <div className="text-center p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="text-2xl font-bold text-amber-700">{data.summary_insights?.experience_level || 'N/A'}</div>
            <div className="text-sm text-amber-600">Experience Level</div>
          </div>
        </div>

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

        {/* Priority Improvements */}
        {data.summary_insights?.priority_improvements && (
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Priority Improvements</h3>
            <div className="space-y-2">
              {data.summary_insights.priority_improvements.map((item, index) => (
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

      {/* Detailed Analysis */}
      {data.detailed_analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Detailed Metrics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(data.detailed_analysis).map(([category, categoryData]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-slate-800 capitalize">
                  {category.replace(/_/g, ' ')}
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Overall Score</span>
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
        </div>
      )}

      {/* Section Analysis */}
      {data.section_analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Section-by-Section Analysis</h2>
          <div className="space-y-4">
            {Object.entries(data.section_analysis).map(([section, sectionData]) => (
              <div key={section} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 capitalize">
                    {section.replace(/_/g, ' ')}
                  </h3>
                  <span className="font-bold text-blue-600">{sectionData.score}/100</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{sectionData.feedback}</p>
                {sectionData.suggestions && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Suggestions:</span>
                    <ul className="mt-1 space-y-1">
                      {sectionData.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-xs text-slate-600">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Improvement Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.strengths && (
          <ResultCard title="Key Strengths">
            <BulletList items={data.strengths} tone="positive" />
          </ResultCard>
        )}

        {data.improvement_areas && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Areas for Improvement</h2>
            <ul className="space-y-2">
              {data.improvement_areas.map((area, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-600">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ATS Analysis */}
      {data.ats_analysis && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">ATS Compatibility Analysis</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600">ATS Score</span>
            <span className="text-2xl font-bold text-blue-600">{data.ats_analysis.score}/100</span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {data.ats_analysis.strengths && (
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {data.ats_analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-slate-600">• {strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.ats_analysis.issues && (
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Issues</h3>
                <ul className="space-y-1">
                  {data.ats_analysis.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-slate-600">• {issue}</li>
                  ))}
                </ul>
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

      {/* Actionable Recommendations */}
      {data.actionable_recommendations && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Actionable Recommendations</h2>
          <div className="space-y-4">
            {data.actionable_recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800">{rec.category}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${
                    rec.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                    rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-1">{rec.action}</p>
                <p className="text-slate-500 text-xs italic">{rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Insights */}
      {data.industry_insights && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Industry Insights</h2>
          <div className="space-y-4">
            {data.industry_insights.current_trends && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Current Industry Trends</h3>
                <div className="flex flex-wrap gap-2">
                  {data.industry_insights.current_trends.map((trend, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-sm">
                      {trend}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {data.industry_insights.skill_recommendations && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Recommended Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.industry_insights.skill_recommendations.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 border border-green-200 text-green-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {data.industry_insights.market_positioning && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Market Positioning</h3>
                <p className="text-slate-600 text-sm">{data.industry_insights.market_positioning}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
