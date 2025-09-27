'use client';

import React, { useState } from 'react';
import {
  Edit3,
  Sparkles,
  Copy,
  Check,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Bot,
  FileText,
  Star,
} from 'lucide-react';
import Header from '../../components/Header';

export default function SectionImprovementPage() {
  const [selectedSection, setSelectedSection] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  const sectionTypes = [
    {
      id: 'summary',
      name: 'Professional Summary',
      description: 'A brief overview of your professional experience and goals',
      placeholder:
        'Experienced software developer with 5+ years of experience in full-stack development...',
    },
    {
      id: 'experience',
      name: 'Work Experience',
      description: 'Individual job descriptions or bullet points',
      placeholder:
        'Software Engineer at TechCorp\n• Developed web applications using React and Node.js\n• Collaborated with cross-functional teams...',
    },
    {
      id: 'skills',
      name: 'Skills Section',
      description: 'Technical and soft skills listing',
      placeholder:
        'Programming Languages: JavaScript, Python, Java\nFrameworks: React, Angular, Django\nDatabases: MySQL, MongoDB...',
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Educational background and achievements',
      placeholder:
        'Bachelor of Science in Computer Science\nUniversity of Technology, 2020\nRelevant Coursework: Data Structures, Algorithms...',
    },
    {
      id: 'projects',
      name: 'Projects',
      description: 'Personal or professional project descriptions',
      placeholder:
        'E-commerce Platform\n• Built a full-stack e-commerce application using MERN stack\n• Implemented payment processing with Stripe...',
    },
  ];

  // Handle section selection and clear textarea
  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setOriginalText(''); // Clear the textarea when section changes
    setResult(null); // Clear previous results
    setError(null); // Clear any previous errors
  };

  const handleImprovement = async () => {
    if (!selectedSection || !originalText.trim()) {
      setError('Please select a section type and enter text to improve');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/improve-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_type: selectedSection,
          original_text: originalText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.error || 'Server error occurred');
      }

      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while improving the section');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    });
  };

  const selectedSectionInfo = sectionTypes.find((s) => s.id === selectedSection);

  // Function to parse markdown-style bold text (**text**)
  const parseMarkdownText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-slate-900">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <Header
        title="Section Enhancement"
        subtitle="Improve specific sections with AI-powered suggestions"
        icon={Edit3}
        iconColor="text-violet-600"
        backTo="/"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Section Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Select Section Type
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectionTypes.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 h-full flex flex-col ${
                    selectedSection === section.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-25'
                  }`}
                >
                  <h3 className="font-semibold text-slate-800 mb-2 leading-tight">
                    {section.name}
                  </h3>
                  <p className="text-sm text-slate-600 flex-grow">
                    {section.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Enter Your Content
            </h2>
            {selectedSectionInfo && (
              <div className="mb-4 p-4 bg-emerald-50 rounded-xl">
                <h3 className="font-medium text-emerald-800 mb-1">
                  {selectedSectionInfo.name}
                </h3>
                <p className="text-sm text-emerald-700">
                  {selectedSectionInfo.description}
                </p>
              </div>
            )}
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder={
                selectedSectionInfo?.placeholder ||
                'Select a section type first...'
              }
              disabled={!selectedSection}
              className="w-full h-40 p-4 border border-slate-300 text-gray-800 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-600">
                {originalText.length} characters
              </span>
              <button
                onClick={handleImprovement}
                disabled={!selectedSection || !originalText.trim() || isLoading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Improve Section
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">×</span>
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold">
                    Improvement Failed
                  </h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
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
                      copyToClipboard(result.improved_text, 'improved')
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
                    {parseMarkdownText(result.improved_text)}
                  </div>
                </div>
              </div>

              {/* Improvement Analysis */}
              {result.analysis && (
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
                        {result.improvement_score || 0}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${result.improvement_score || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Improvements */}
                  {result.key_improvements && result.key_improvements.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-800 mb-3">
                        Key Improvements Made
                      </h3>
                      <div className="space-y-2">
                        {result.key_improvements.map((improvement, index) => (
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
                    {result.analysis.original_strengths &&
                      result.analysis.original_strengths.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={16} />
                            Original Strengths
                          </h3>
                          <div className="space-y-2">
                            {result.analysis.original_strengths.map(
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

                    {result.analysis.original_weaknesses &&
                      result.analysis.original_weaknesses.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <AlertTriangle
                              className="text-orange-600"
                              size={16}
                            />
                            Areas for Improvement
                          </h3>
                          <div className="space-y-2">
                            {result.analysis.original_weaknesses.map(
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
                  {result.analysis.improvements_made &&
                    result.analysis.improvements_made.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-slate-800 mb-3">
                          Specific Changes Made
                        </h3>
                        <div className="space-y-3">
                          {result.analysis.improvements_made.map(
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
              {result.ats_optimization && (
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
                                  result.ats_optimization.keyword_density || 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-blue-600 font-bold">
                          {result.ats_optimization.keyword_density || 0}%
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
                                  result.ats_optimization.formatting_score || 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-purple-600 font-bold">
                          {result.ats_optimization.formatting_score || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Keywords */}
                  {result.ats_optimization.suggested_keywords &&
                    result.ats_optimization.suggested_keywords.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-slate-800 mb-3">
                          Suggested Keywords to Include
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.ats_optimization.suggested_keywords.map(
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
              {result.alternatives && result.alternatives.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-6">
                    <Star className="text-indigo-600" size={20} />
                    Alternative Versions
                  </h2>
                  <div className="space-y-4">
                    {result.alternatives.map((alternative, index) => (
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
                              copyToClipboard(
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
              {result.tips && result.tips.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Lightbulb className="text-amber-500" size={20} />
                    Professional Tips
                  </h2>
                  <div className="space-y-3">
                    {result.tips.map((tip, index) => (
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
              {result.formatting_suggestions &&
                result.formatting_suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
                      <FileText className="text-green-600" size={20} />
                      Formatting Suggestions
                    </h2>
                    <div className="space-y-3">
                      {result.formatting_suggestions.map(
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
            </div>
          )}
        </div>
      </main>

      {/* Info Section */}
      {!result && !isLoading && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              How Section Enhancement Works
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">
                  What We Improve
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Action verb optimization</li>
                  <li>• Quantifiable achievement addition</li>
                  <li>• Industry-specific terminology</li>
                  <li>• Impact-focused language</li>
                  <li>• ATS-friendly formatting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Enhancement Features
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Improved version of your content</li>
                  <li>• Specific improvement suggestions</li>
                  <li>• Before/after comparison</li>
                  <li>• Copy-friendly formatting</li>
                  <li>• Section-specific optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}