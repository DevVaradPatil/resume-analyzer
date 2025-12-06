'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  FileText,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Navbar from '../../../../components/Navbar';

export default function AnalysisViewPage({ params }) {
  const analysisId = React.use(params).id;
  const { isLoaded } = useUser();
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoaded && analysisId) {
      fetchAnalysis();
    }
  }, [isLoaded, analysisId]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/dashboard/analysis/${analysisId}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }
        if (response.status === 404) {
          throw new Error('Analysis not found');
        }
        throw new Error('Failed to load analysis');
      }

      const result = await response.json();
      console.log("Analysis result: ", result.data);
      

      if (result.status === 'success' && result.data) {
        setAnalysis(result.data);
      } else {
        throw new Error('Invalid analysis data');
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Unable to load analysis results');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-100';
    if (score >= 60) return 'bg-yellow-50 border-yellow-100';
    if (score >= 40) return 'bg-orange-50 border-orange-100';
    return 'bg-red-50 border-red-100';
  };

  const renderJobAnalysisResults = (data) => {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Resume Analysis Summary</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{data.overall_score || data.score}/100</div>
              <div className="text-sm text-slate-600">Overall Score</div>
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
              <div className="text-2xl font-bold text-purple-700">{data.summary_insights?.market_competitiveness || 0}%</div>
              <div className="text-sm text-purple-600">Competitive</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="text-2xl font-bold text-indigo-700">{data.summary_insights?.professional_presentation || 0}%</div>
              <div className="text-sm text-indigo-600">Presentation</div>
            </div>
          </div>

          {data.summary_insights?.experience_level && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Experience Level</h3>
              <div className="text-xl font-bold text-amber-700">{data.summary_insights.experience_level}</div>
            </div>
          )}

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

          {data.summary_insights?.priority_improvements && (
            <div className="mb-4">
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

            {data.strengths && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {data.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.improvement_areas && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-2">Areas for Improvement</h3>
                <ul className="space-y-1">
                  {data.improvement_areas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {data.ats_analysis && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">ATS Compatibility Analysis</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600">ATS Score</span>
              <span className="text-2xl font-bold text-blue-600">{data.ats_analysis.score}/100</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {data.ats_analysis.strengths && (
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {data.ats_analysis.strengths.map((item, index) => (
                      <li key={index} className="text-sm text-slate-600">• {item}</li>
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

        {data.section_analysis && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Section-by-Section Feedback</h2>
            <div className="space-y-4">
              {Object.entries(data.section_analysis).map(([section, sectionData]) => (
                <div key={section} className={`border rounded-lg p-4 ${getScoreBgColor(sectionData.score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 capitalize">
                      {section.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-lg font-bold text-slate-700">{sectionData.score}/100</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{sectionData.feedback}</p>
                  {sectionData.suggestions && sectionData.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-1">Suggestions:</h4>
                      <ul className="space-y-1">
                        {sectionData.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-slate-600">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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

        {data.industry_insights && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Industry Insights</h2>

            {data.industry_insights.market_positioning && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-2">Market Positioning</h3>
                <p className="text-sm text-slate-600">{data.industry_insights.market_positioning}</p>
              </div>
            )}

            {data.industry_insights.current_trends && (
              <div className="mb-4">
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
                <h3 className="font-semibold text-slate-800 mb-2">Skill Recommendations</h3>
                <ul className="space-y-1">
                  {data.industry_insights.skill_recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-slate-600">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {data.actionable_recommendations && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Actionable Recommendations</h2>
            <div className="space-y-4">
              {data.actionable_recommendations.map((item, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${
                      item.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium flex-shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 mt-3">{item.action}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!analysis?.analysisResult) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
          <p className="text-slate-600">No analysis data available.</p>
        </div>
      );
    }

    return renderJobAnalysisResults(analysis.analysisResult);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Loading analysis...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {analysis?.fileName || 'Resume Analysis'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(analysis?.createdAt)}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {analysis?.analysisType || 'Analysis'}
                    </span>
                  </div>
                </div>
              </div>

              {analysis?.score != null && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{analysis.score}%</div>
                  <div className="text-sm text-slate-500">Score</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {renderAnalysisResults()}
      </main>
    </div>
  );
}
