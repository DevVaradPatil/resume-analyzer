'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { FileText, Target, Users, TrendingUp } from 'lucide-react';
import { AdWrapper, HeaderBannerAd, InFeedAd, FooterBannerAd } from '../../components/ads';

export default function BlogPage() {
  const articles = [
    {
      id: 1,
      title: "10 Essential Resume Keywords That Get You Noticed by ATS Systems",
      excerpt: "Learn which keywords recruiters and ATS systems are looking for in 2025. Discover industry-specific terms that will help your resume pass through automated screening.",
      date: "2025-01-15",
      readTime: "5 min read",
      icon: Target,
      slug: "ats-resume-keywords-2025"
    },
    {
      id: 2,
      title: "How to Optimize Your Resume for Remote Work Opportunities",
      excerpt: "Stand out in the remote job market with these proven strategies. Learn how to highlight remote work skills and experience effectively.",
      date: "2025-01-10",
      readTime: "7 min read",
      icon: Users,
      slug: "remote-work-resume-optimization"
    },
    {
      id: 3,
      title: "The Ultimate Guide to Resume Formatting in 2025",
      excerpt: "Modern resume formatting best practices that work with both ATS systems and human recruiters. Templates and examples included.",
      date: "2025-01-05",
      readTime: "10 min read",
      icon: FileText,
      slug: "resume-formatting-guide-2025"
    },
    {
      id: 4,
      title: "How AI is Changing Resume Screening: What You Need to Know",
      excerpt: "Understanding how AI-powered recruitment tools work and how to optimize your resume for machine learning algorithms.",
      date: "2024-12-28",
      readTime: "6 min read",
      icon: TrendingUp,
      slug: "ai-resume-screening-guide"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      {/* Header Ad */}
      <AdWrapper>
        <div className="pt-16">
          <HeaderBannerAd />
        </div>
      </AdWrapper>
      
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Resume Tips & Career Resources
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Expert advice and actionable strategies to help you create compelling resumes, 
              optimize for ATS systems, and accelerate your career growth.
            </p>
          </header>

          {/* Articles Grid */}
          <section className="space-y-8">
            {articles.map((article, index) => {
              const IconComponent = article.icon;
              return (
                <React.Fragment key={article.id}>
                  <article
                    className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <header>
                          <h2 className="text-2xl font-semibold text-slate-800 mb-3 hover:text-blue-600 transition-colors">
                            <Link href={`/blog/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h2>
                          <div className="flex items-center text-sm text-slate-500 mb-4 space-x-4">
                            <time dateTime={article.date}>
                              {new Date(article.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </time>
                            <span>•</span>
                            <span>{article.readTime}</span>
                          </div>
                        </header>
                        <p className="text-slate-600 leading-relaxed mb-6">
                          {article.excerpt}
                        </p>
                        <Link
                          href={`/blog/${article.slug}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Read full article
                          <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                  
                  {/* Show in-feed ad after 2nd article */}
                  {index === 1 && (
                    <AdWrapper>
                      <InFeedAd />
                    </AdWrapper>
                  )}
                </React.Fragment>
              );
            })}
          </section>

          {/* CTA Section */}
          <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Analyze Your Resume?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Put these tips into practice with our AI-powered resume analyzer
            </p>
            <Link
              href="/resume-analysis"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
            >
              Analyze My Resume
              <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </section>
        </div>
      </main>
      
      {/* Footer Ad */}
      <AdWrapper>
        <FooterBannerAd />
      </AdWrapper>
    </div>
  );
}