'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { 
  FileText, 
  BarChart3, 
  Edit3, 
  Clock, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view your dashboard');
        }
        throw new Error('Failed to load dashboard data');
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setStats(result.data.stats || {
          totalResumes: 0,
          totalAnalyses: 0,
          averageScore: 0,
          lastAnalysisAt: null,
        });
        setRecentAnalyses(result.data.recentAnalyses || []);
      } else {
        // Set safe defaults if data is malformed
        setStats({
          totalResumes: 0,
          totalAnalyses: 0,
          averageScore: 0,
          lastAnalysisAt: null,
        });
        setRecentAnalyses([]);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
      // Set safe defaults on error
      setStats({
        totalResumes: 0,
        totalAnalyses: 0,
        averageScore: 0,
        lastAnalysisAt: null,
      });
      setRecentAnalyses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      fetchDashboardData();
    }
  }, [isLoaded, fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatAnalysisType = (type) => {
    const types = {
      'job_match': 'Job Match',
      'overall': 'Overall Analysis',
      'section_improvement': 'Section Improvement',
    };
    return types[type] || type || 'Analysis';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const features = [
    {
      icon: FileText,
      title: 'Resume & Job Match',
      description: 'Analyze how well your resume matches a job description',
      href: '/resume-analysis',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: BarChart3,
      title: 'Resume Analytics',
      description: 'Get detailed analytics about your resume quality',
      href: '/analytics',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      icon: Edit3,
      title: 'Section Enhancement',
      description: 'Improve specific sections with AI suggestions',
      href: '/section-improvement',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Welcome back, {user?.firstName || 'there'}! 👋
            </h1>
            <p className="text-slate-600">
              What would you like to improve on your resume today?
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Unable to load some data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.totalResumes ?? 0}
                </p>
                <p className="text-sm text-slate-500">Resumes Analyzed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.totalAnalyses ?? 0}
                </p>
                <p className="text-sm text-slate-500">Total Analyses</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.averageScore ? `${stats.averageScore}%` : '--'}
                </p>
                <p className="text-sm text-slate-500">Avg. Score</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {formatDate(stats?.lastAnalysisAt)}
                </p>
                <p className="text-sm text-slate-500">Last Analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.lightColor} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.textColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                {feature.description}
              </p>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Recent Analyses</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {recentAnalyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/dashboard/analysis/${analysis.id}`}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                        {analysis.file_name || 'Untitled Resume'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatDate(analysis.created_at)} • {formatAnalysisType(analysis.analysis_type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {analysis.score != null && (
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          analysis.score >= 80 ? 'text-green-600' :
                          analysis.score >= 60 ? 'text-blue-600' :
                          analysis.score >= 40 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {analysis.score}%
                        </p>
                        <p className="text-sm text-slate-500">Score</p>
                      </div>
                    )}
                    <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Recent Analyses */}
        {recentAnalyses.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No analyses yet</h3>
            <p className="text-slate-600 mb-4">
              Upload your first resume to get started with AI-powered analysis.
            </p>
            <Link
              href="/resume-analysis"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Analyze Your Resume
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
