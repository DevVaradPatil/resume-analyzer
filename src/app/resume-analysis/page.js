'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import Header from '../../components/Header';
import FileUpload from '../../components/FileUpload';

export default function ResumeAnalysisPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysis = async (file, jobDescription) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.status === 'error') {
        throw new Error(data.error || 'Server error occurred');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while analyzing the resume');
    } finally {
      setIsLoading(false);
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
                  <ul className="space-y-1">
                    {data.comprehensive_analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.comprehensive_analysis.weaknesses && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Areas for Improvement</h3>
                  <ul className="space-y-1">
                    {data.comprehensive_analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        title="Resume & Job Match Analysis"
        subtitle="Upload your resume and job description for compatibility insights"
        icon={FileText}
        iconColor="text-blue-600"
        backTo="/"
      />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Analysis Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Comprehensive Analysis</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Get detailed insights with ATS analysis, gap assessment, section-by-section feedback, and industry-specific recommendations
                </p>
              </div>
            </div>
            
            {/* Features included */}
            <div className="mt-4">
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Analysis Features</h4>
                <ul className="text-xs space-y-1 text-gray-600 grid md:grid-cols-2 gap-1">
                  <li>• Job match score & skills matching</li>
                  <li>• ATS compatibility check</li>
                  <li>• Gap analysis & learning paths</li>
                  <li>• Section-by-section feedback</li>
                  <li>• Industry-specific insights</li>
                  <li>• Overall grade & competitiveness</li>
                </ul>
              </div>
            </div>
          </div>
          
          <FileUpload onAnalyze={handleAnalysis} hideJobDescription={false} />
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">×</span>
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold">Analysis Failed</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center animate-fadeIn">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <h3 className="text-blue-800 font-semibold text-lg">
                    Running Comprehensive Analysis
                  </h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Performing detailed analysis including ATS compatibility, gap assessment, and section feedback...
                  </p>
                  <div className="mt-3 text-xs text-blue-600">
                    <div>• Content quality analysis</div>
                    <div>• ATS compatibility check</div>
                    <div>• Industry insights generation</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Results */}
          {result && !isLoading && renderJobAnalysisResults(result)}
        </div>
      </main>

      {/* Info Section */}
      {!result && !isLoading && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">How This Analysis Works</h2>
            <div className="grid md:grid-cols-2 gap-6 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">What We Analyze</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Skills matching with job requirements</li>
                  <li>• Keyword optimization for ATS systems</li>
                  <li>• Resume structure and formatting</li>
                  <li>• Experience relevance assessment</li>
                  <li>• Industry-specific language usage</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">What You'll Get</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Overall compatibility score (0-100)</li>
                  <li>• Detailed skill gap analysis</li>
                  <li>• Specific improvement suggestions</li>
                  <li>• Missing keywords identification</li>
                  <li>• Resume quality metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}