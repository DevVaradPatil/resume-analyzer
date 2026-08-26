"use client";

import React from "react";
import { AlertTriangle, Bot, Check, CheckCircle, Copy, FileText, Lightbulb, Sparkles, Star } from "lucide-react";
import { AdWrapper, ResultsAd } from "../ads";

/**
 * Renders markdown-style bold (**text**) as <strong>.
 *
 * Moved here from the page component along with the markup that uses it -- it
 * was the one closure dependency of this block, and the extraction initially
 * left it behind, which crashed the component at render time.
 */
function parseMarkdownText(text) {
  if (typeof text !== 'string') return text;

  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Result rendering for the section-improvement feature.
 *
 * Extracted from the page component, which had grown to ~690 lines with all of
 * this inline. Unlike the other two result renderers this one is not pure -- it
 * needs the copy-to-clipboard state -- so that is passed in rather than closed
 * over.
 *
 * @param {Object} props
 * @param {Object} props.data - Parsed improvement result from the API
 * @param {string} props.copiedText - Which block was last copied, for the tick
 * @param {Function} props.onCopy - (text, type) => void
 */
export default function SectionImprovementResults({ data, copiedText, onCopy }) {
  if (!data) return null;

  return (
        <div className="space-y-6">
          {/* Improved Version */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={20} />
                Improved Version
              </h2>
              <button
                onClick={() =>
                  onCopy(data.improved_text, 'improved')
                }
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {copiedText === 'improved' ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="whitespace-pre-wrap text-slate-800 font-medium">
                {parseMarkdownText(data.improved_text)}
              </div>
            </div>
          </div>

          {/* Improvement Analysis */}
          {data.analysis && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <Lightbulb className="text-amber-500" size={20} />
                Detailed Analysis & Feedback
              </h2>

              {/* Improvement Score */}
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800">
                    Improvement Score
                  </h3>
                  <span className="text-2xl font-bold text-emerald-600">
                    {data.improvement_score || 0}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${data.improvement_score || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Key Improvements */}
              {data.key_improvements && data.key_improvements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Key Improvements Made
                  </h3>
                  <div className="space-y-2">
                    {data.key_improvements.map((improvement, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Check size={12} />
                        </div>
                        <p className="text-slate-700 text-sm">
                          {parseMarkdownText(improvement)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {data.analysis.original_strengths &&
                  data.analysis.original_strengths.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={16} />
                        Original Strengths
                      </h3>
                      <div className="space-y-2">
                        {data.analysis.original_strengths.map(
                          (strength, index) => (
                            <div
                              key={index}
                              className="p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <p className="text-green-800 text-sm">
                                {parseMarkdownText(strength)}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {data.analysis.original_weaknesses &&
                  data.analysis.original_weaknesses.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <AlertTriangle
                          className="text-orange-600"
                          size={16}
                        />
                        Areas for Improvement
                      </h3>
                      <div className="space-y-2">
                        {data.analysis.original_weaknesses.map(
                          (weakness, index) => (
                            <div
                              key={index}
                              className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                            >
                              <p className="text-orange-800 text-sm">
                                {parseMarkdownText(weakness)}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Specific Improvements Made */}
              {data.analysis.improvements_made &&
                data.analysis.improvements_made.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-800 mb-3">
                      Specific Changes Made
                    </h3>
                    <div className="space-y-3">
                      {data.analysis.improvements_made.map(
                        (improvement, index) => (
                          <div
                            key={index}
                            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                                    {improvement.category}
                                  </span>
                                </div>
                                <p className="text-blue-900 font-medium text-sm mb-1">
                                  {parseMarkdownText(improvement.change)}
                                </p>
                                <p className="text-blue-700 text-xs">
                                  {parseMarkdownText(improvement.reason)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* ATS Optimization */}
          {data.ats_optimization && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <Bot className="text-blue-600" size={20} />
                ATS Optimization
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Keyword Density */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Keyword Density
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-grow">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${
                              data.ats_optimization.keyword_density || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold">
                      {data.ats_optimization.keyword_density || 0}%
                    </span>
                  </div>
                </div>

                {/* Format Score */}
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Format Score
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-grow">
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${
                              data.ats_optimization.formatting_score || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-purple-600 font-bold">
                      {data.ats_optimization.formatting_score || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggested Keywords */}
              {data.ats_optimization.suggested_keywords &&
                data.ats_optimization.suggested_keywords.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-slate-800 mb-3">
                      Suggested Keywords to Include
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.ats_optimization.suggested_keywords.map(
                        (keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 border border-blue-400 text-blue-700 bg-white text-sm rounded-full font-medium"
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Alternative Versions */}
          {data.alternatives && data.alternatives.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-6">
                <Star className="text-indigo-600" size={20} />
                Alternative Versions
              </h2>
              <div className="space-y-4">
                {data.alternatives.map((alternative, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800">
                        {alternative.version}
                      </h3>
                      <button
                        onClick={() =>
                          onCopy(
                            alternative.text,
                            `alternative-${index}`
                          )
                        }
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors text-sm"
                      >
                        {copiedText === `alternative-${index}` ? (
                          <>
                            <Check size={14} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                      <div className="whitespace-pre-wrap text-slate-800 text-sm">
                        {parseMarkdownText(alternative.text)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {data.tips && data.tips.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Lightbulb className="text-amber-500" size={20} />
                Professional Tips
              </h2>
              <div className="space-y-3">
                {data.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Lightbulb size={12} className="text-white" />
                    </div>
                    <p className="text-amber-800 text-sm">
                      {parseMarkdownText(tip)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formatting Suggestions */}
          {data.formatting_suggestions &&
            data.formatting_suggestions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <FileText className="text-green-600" size={20} />
                  Formatting Suggestions
                </h2>
                <div className="space-y-3">
                  {data.formatting_suggestions.map(
                    (suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-green-50 rounded-xl"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <p className="text-green-800 text-sm">
                          {parseMarkdownText(suggestion)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        
            {/* Ad after results */}
            <AdWrapper>
              <ResultsAd className="mt-8" />
            </AdWrapper>
        </div>
  );
}
