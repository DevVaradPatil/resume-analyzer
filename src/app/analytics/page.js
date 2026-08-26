'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import FileUpload from '../../components/FileUpload';
import UpgradeModal from '../../components/UpgradeModal';
import AnalysisProgress, { ANALYTICS_STAGES } from '../../components/AnalysisProgress';
import AnalyticsResults from '../../components/results/AnalyticsResults';
import { AdWrapper, ResultsAd, FooterBannerAd } from '../../components/ads';

export default function AnalyticsPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);

  const handleAnalysis = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-overall', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      // Handle subscription limit reached
      if (data.status === 'LIMIT_REACHED') {
        setUpgradeData({
          reason: 'LIMIT_REACHED',
          featureType: 'analytics',
          tier: data.tier,
          used: data.used,
          remaining: data.remaining,
          limit: data.limit,
          resetDate: data.resetDate,
        });
        setShowUpgradeModal(true);
        return;
      }
      
      // Handle file too large
      if (data.status === 'FILE_TOO_LARGE') {
        setUpgradeData({
          reason: 'FILE_TOO_LARGE',
          featureType: 'analytics',
          tier: data.tier,
          maxSize: data.maxSize,
          currentSize: data.currentSize,
        });
        setShowUpgradeModal(true);
        return;
      }
      
      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }
      
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Analysis Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Comprehensive Resume Analysis</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Get detailed insights about your resume's quality, ATS compatibility, market competitiveness, and professional presentation
                </p>
              </div>
            </div>
            
            {/* Features included */}
            <div className="mt-4">
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                <h4 className="font-medium text-gray-700 text-sm mb-2">Analysis Features</h4>
                <ul className="text-xs space-y-1 text-gray-600 grid md:grid-cols-2 gap-1">
                  <li>• Overall quality score & grading</li>
                  <li>• ATS compatibility assessment</li>
                  <li>• Market competitiveness analysis</li>
                  <li>• Section-by-section evaluation</li>
                  <li>• Professional presentation review</li>
                  <li>• Industry trends & insights</li>
                  <li>• Actionable improvement recommendations</li>
                  <li>• Strengths & weakness identification</li>
                </ul>
              </div>
            </div>
          </div>
          
          <FileUpload onAnalyze={handleAnalysis} hideJobDescription={true} />
          
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
            <AnalysisProgress
              title="Running Comprehensive Analytics"
              stages={ANALYTICS_STAGES}
            />
          )}
          
          {/* Results */}
          {result && !isLoading && (
            <>
              <AnalyticsResults data={result} />
              {/* Ad after results */}
              <AdWrapper>
                <ResultsAd className="mt-8" />
              </AdWrapper>
            </>
          )}
        </div>
      </main>

      {/* Info Section */}
      {!result && !isLoading && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">How Resume Analytics Works</h2>
            <div className="grid md:grid-cols-2 gap-6 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">What We Analyze</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Overall content quality and impact</li>
                  <li>• Resume structure and formatting</li>
                  <li>• ATS compatibility and optimization</li>
                  <li>• Professional presentation standards</li>
                  <li>• Market competitiveness factors</li>
                  <li>• Section completeness and effectiveness</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">What You'll Get</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Overall quality score and grade</li>
                  <li>• Detailed metrics breakdown</li>
                  <li>• Section-by-section feedback</li>
                  <li>• Actionable improvement recommendations</li>
                  <li>• Industry trends and insights</li>
                  <li>• ATS optimization suggestions</li>
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
        featureType="analytics"
        currentTier={upgradeData?.tier || 'free'}
        usageInfo={upgradeData}
      />
    </div>
  );
}