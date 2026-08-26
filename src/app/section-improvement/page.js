'use client';

import React, { useState } from 'react';
import { Sparkles, Copy } from 'lucide-react';
import Navbar from '../../components/Navbar';
import UpgradeModal from '../../components/UpgradeModal';
import AnalysisProgress, { SECTION_IMPROVEMENT_STAGES } from '../../components/AnalysisProgress';
import SectionImprovementResults from '../../components/results/SectionImprovementResults';
import { AdWrapper, FooterBannerAd } from '../../components/ads';

export default function SectionImprovementPage() {
  const [selectedSection, setSelectedSection] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedText, setCopiedText] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);

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

      const data = await response.json();

      // Handle subscription limit reached
      if (data.status === 'LIMIT_REACHED') {
        setUpgradeData({
          reason: 'LIMIT_REACHED',
          featureType: 'improve',
          tier: data.tier,
          used: data.used,
          remaining: data.remaining,
          limit: data.limit,
          resetDate: data.resetDate,
        });
        setShowUpgradeModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <Navbar />

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

          {/* Progress */}
          {isLoading && (
            <AnalysisProgress
              title="Improving Your Section"
              stages={SECTION_IMPROVEMENT_STAGES}
            />
          )}

          {/* Results */}
          {result && !isLoading && (
            <SectionImprovementResults
              data={result}
              copiedText={copiedText}
              onCopy={copyToClipboard}
            />
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

      {/* Footer Ad */}
      <AdWrapper>
        <FooterBannerAd />
      </AdWrapper>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeData?.reason || 'LIMIT_REACHED'}
        featureType="improve"
        currentTier={upgradeData?.tier || 'free'}
        usageInfo={upgradeData}
      />
    </div>
  );
}