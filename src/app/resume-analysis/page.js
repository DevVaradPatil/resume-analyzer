'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import FileUpload from '../../components/FileUpload';
import UpgradeModal from '../../components/UpgradeModal';
import AnalysisProgress, { JOB_MATCH_STAGES } from '../../components/AnalysisProgress';
import JobMatchResults from '../../components/results/JobMatchResults';
import { AdWrapper, ResultsAd, FooterBannerAd } from '../../components/ads';
import { 
  trackResumeUpload, 
  trackAnalysisStart, 
  trackAnalysisComplete, 
  trackAnalysisError,
  trackPageView 
} from '../../lib/analytics';

export default function ResumeAnalysisPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);

  useEffect(() => {
    // Track page view when component mounts
    trackPageView('resume_analysis');
  }, []);

  const handleAnalysis = async (file, jobDescription) => {
    const startTime = Date.now();
    
    // Track resume upload
    trackResumeUpload(file.size, file.type);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Track analysis start
    trackAnalysisStart(!!jobDescription.trim());

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      // Handle subscription limit reached
      if (data.status === 'LIMIT_REACHED') {
        setUpgradeData({
          reason: 'LIMIT_REACHED',
          featureType: 'analyze',
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
          featureType: 'analyze',
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
      
      // Track successful analysis
      const duration = Date.now() - startTime;
      trackAnalysisComplete(data.score || 0, duration);
      
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      
      // Track analysis error
      trackAnalysisError('analysis_failed', err.message);
      
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
            <AnalysisProgress
              title="Running Comprehensive Analysis"
              stages={JOB_MATCH_STAGES}
            />
          )}
          
          {/* Results */}
          {result && !isLoading && (
            <>
              <JobMatchResults data={result} />
              {/* Ad after results - non-intrusive placement */}
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

      {/* Footer Ad - Before site footer */}
      <AdWrapper>
        <FooterBannerAd />
      </AdWrapper>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeData?.reason || 'LIMIT_REACHED'}
        featureType="analyze"
        currentTier={upgradeData?.tier || 'free'}
        usageInfo={upgradeData}
      />
    </div>
  );
}