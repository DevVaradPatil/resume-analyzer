'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, Clock, User } from 'lucide-react';

export default function DynamicBlogPost() {
  const params = useParams();
  const slug = params?.slug;
  
  // Article data mapping
  const articleData = {
    'ats-resume-keywords-2025': {
      title: '10 Essential Resume Keywords That Get You Noticed by ATS Systems',
      date: '2025-01-15',
      readTime: '5 min read',
      content: `
        <p>If you've ever applied for a job online, chances are your resume was first read by an <strong>Applicant Tracking System (ATS)</strong> before it ever reached a recruiter's eyes. These systems scan resumes for specific keywords to determine whether you're a strong match for the role.</p>
        
        <h2>Why Keywords Matter</h2>
        <p>ATS systems filter out resumes that don't contain the right keywords, even if you're highly qualified. Here are the 10 essential keywords that will help you pass these filters:</p>
        
        <h3>1. Leadership</h3>
        <p>Employers look for candidates who can take charge, manage people, and guide projects to success. Use words like <em>lead, manage, oversee,</em> or <em>coordinate</em>.</p>
        <blockquote><strong>Example:</strong> "Led a 5-member development team to deliver a client project 2 weeks ahead of schedule."</blockquote>
        
        <h3>2. Collaboration</h3>
        <p>Companies value team players. Using words like <em>collaborated, partnered, supported,</em> and <em>worked with</em> signals that you thrive in group settings.</p>
        <blockquote><strong>Example:</strong> "Collaborated with designers and developers to build a responsive e-commerce platform."</blockquote>
        
        <h3>3. Problem-Solving</h3>
        <p>Recruiters want people who can think critically and resolve challenges. Phrases like <em>analyzed, identified, resolved,</em> and <em>optimized</em> demonstrate strong problem-solving skills.</p>
        
        <h3>4. Communication</h3>
        <p>Clear communication is essential in every role. Keywords include <em>presented, documented, negotiated,</em> and <em>explained</em>.</p>
        
        <h3>5. Innovation</h3>
        <p>ATS often flags candidates who bring creativity to the table. Terms like <em>developed, created, designed,</em> and <em>implemented</em> show initiative.</p>
        
        <h2>Final Tips</h2>
        <ul>
          <li><strong>Mirror the job description:</strong> Scan the posting and align your keywords with it</li>
          <li><strong>Use them naturally:</strong> Don't just stuff keywords—back them with real achievements</li>
          <li><strong>Balance hard and soft skills:</strong> Employers want both technical expertise and interpersonal strengths</li>
        </ul>
        
        <p>The right keywords can be the difference between your resume being overlooked or landing an interview. By incorporating these essential ATS-friendly keywords, you'll pass automated filters and show recruiters you're exactly who they're looking for.</p>
      `
    },
    'remote-work-resume-optimization': {
      title: 'How to Optimize Your Resume for Remote Work Opportunities',
      date: '2025-01-10',
      readTime: '7 min read',
      content: `
        <p>Remote work has transformed from a perk into a standard option across industries. With more companies embracing flexible arrangements, competition for remote roles has skyrocketed. To stand out, your resume must highlight not only your skills but also your ability to thrive in a virtual environment.</p>
        
        <h2>Key Strategies for Remote Resume Optimization</h2>
        
        <h3>1. Highlight Remote Experience</h3>
        <p>If you've worked remotely before, showcase it clearly. Hiring managers want proof that you can stay productive outside a traditional office.</p>
        <blockquote><strong>Example:</strong> "Software Engineer | Remote | 2022–2024 — Led cross-time-zone team meetings and delivered projects ahead of schedule."</blockquote>
        
        <h3>2. Emphasize Digital Communication Skills</h3>
        <p>Remote roles depend heavily on written and verbal communication. Use keywords like <em>Slack, Zoom, Microsoft Teams, documentation,</em> and <em>presentations</em>.</p>
        
        <h3>3. Showcase Self-Management</h3>
        <p>Without in-person supervision, employers value independent workers. Highlight terms like <em>organized, managed, delivered,</em> and <em>prioritized</em>.</p>
        
        <h3>4. Include Remote-Friendly Tools</h3>
        <p>Mention platforms like <em>Trello, Jira, Asana, GitHub, Notion,</em> and <em>Google Workspace</em>.</p>
        
        <h2>Resume Header Optimization</h2>
        <p>Instead of a fixed location, add phrases like "Open to Remote Opportunities" or "Remote | Hybrid | Onsite."</p>
        
        <h2>Key Takeaway</h2>
        <p>A resume optimized for remote work shows employers that you can succeed in a distributed, digital-first environment. By tailoring your resume with the right keywords, tools, and achievements, you'll boost your chances of landing your next remote opportunity.</p>
      `
    },
    'resume-formatting-guide-2025': {
      title: 'The Ultimate Guide to Resume Formatting in 2025',
      date: '2025-01-05',
      readTime: '10 min read',
      content: `
        <p>Your resume is your first impression—and in 2025, hiring managers and Applicant Tracking Systems (ATS) expect more than just a list of jobs and skills. With the rise of AI-driven hiring, <strong>resume formatting</strong> has become critical to your success.</p>
        
        <h2>Essential Formatting Rules</h2>
        
        <h3>1. Keep It ATS-Friendly</h3>
        <p>No matter how visually appealing your resume looks, if an ATS can't read it, it won't reach recruiters.</p>
        <ul>
          <li><strong>Do:</strong> Use simple fonts like Arial, Calibri, or Helvetica</li>
          <li><strong>Do:</strong> Save as PDF unless specified otherwise</li>
          <li><strong>Don't:</strong> Use text inside images or complex graphics</li>
        </ul>
        
        <h3>2. Length Guidelines</h3>
        <p>Recruiters spend less than 10 seconds scanning a resume. One page is ideal for early-career professionals, while experienced candidates can use two pages.</p>
        
        <h3>3. Clean Layout Principles</h3>
        <ul>
          <li>Use 0.5-1 inch margins on all sides</li>
          <li>10-12pt font size for body text</li>
          <li>14-16pt for headers</li>
          <li>Consistent spacing between sections</li>
        </ul>
        
        <h2>Optimal Section Order</h2>
        <ol>
          <li><strong>Header:</strong> Name, location, contact info</li>
          <li><strong>Professional Summary:</strong> 2-3 impactful lines</li>
          <li><strong>Experience:</strong> Most recent first</li>
          <li><strong>Skills:</strong> Technical and soft skills</li>
          <li><strong>Education:</strong> Degree, school, year</li>
          <li><strong>Additional:</strong> Certifications, projects (if relevant)</li>
        </ol>
        
        <h2>Key Takeaway</h2>
        <p>Great resume formatting in 2025 balances ATS compatibility with visual appeal. Keep it clean, consistent, and keyword-rich. Your resume's job is to get you an interview, not showcase design skills.</p>
      `
    },
    'ai-resume-screening-guide': {
      title: 'How AI is Changing Resume Screening: What You Need to Know',
      date: '2024-12-28', 
      readTime: '6 min read',
      content: `
        <p>The hiring process is evolving rapidly. In 2025, most job applications are first screened by <strong>AI-powered Applicant Tracking Systems (ATS)</strong> before reaching human recruiters.</p>
        
        <h2>How AI Screening Works</h2>
        
        <h3>1. AI is the First Recruiter</h3>
        <p>AI systems sort, rank, and reject applications before recruiters see them. They look for:</p>
        <ul>
          <li>Relevant keywords from job descriptions</li>
          <li>Proper formatting and clean structure</li>
          <li>Measurable achievements vs. vague duties</li>
        </ul>
        
        <h3>2. Keywords Are Critical</h3>
        <p>AI-driven systems are highly keyword-focused, matching exact terms from job postings.</p>
        <blockquote><strong>Do:</strong> Use the same terminology as the job listing<br><strong>Don't:</strong> Keyword stuff—AI can detect unnatural patterns</blockquote>
        
        <h3>3. Context Matters</h3>
        <p>Modern AI doesn't just scan for skills; it evaluates how you've applied them.</p>
        <blockquote><strong>Instead of:</strong> "Python"<br><strong>Write:</strong> "Built Python automation scripts that reduced processing time by 40%"</blockquote>
        
        <h2>Optimization Strategies</h2>
        
        <h3>Format Optimization</h3>
        <ul>
          <li>Use standard section headings</li>
          <li>Keep formatting simple and clean</li>
          <li>Include quantifiable results</li>
        </ul>
        
        <h3>Content Optimization</h3>
        <ul>
          <li>Mirror job description language</li>
          <li>Include both acronyms and full terms</li>
          <li>Focus on recent, relevant experience</li>
        </ul>
        
        <h2>The Future</h2>
        <p>Emerging trends include video analysis, skill assessment integration, and predictive analytics based on historical hiring data.</p>
        
        <h2>Key Takeaway</h2>
        <p>AI isn't replacing human recruiters—it's changing how they find candidates. By understanding these systems and optimizing accordingly, you ensure your application gets the attention it deserves.</p>
      `
    }
  };

  const article = articleData[slug];

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Article Not Found</h1>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Blog Article" 
        subtitle="Expert career advice and tips"
        icon={FileText}
        backTo="/blog"
      />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <article className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Article Header */}
            <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex items-center text-sm mb-4 opacity-90 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{article.readTime}</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>ResumeInsight</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {article.title}
              </h1>
            </header>

            {/* Article Content */}
            <div className="p-8 md:p-12">
              <div 
                className="prose prose-lg max-w-none 
                  prose-headings:!text-gray-900 
                  prose-p:!text-gray-900 
                  prose-strong:!text-gray-900 
                  prose-blockquote:!border-l-blue-500 
                  prose-blockquote:!bg-blue-50 
                  prose-blockquote:!p-4 
                  prose-blockquote:!rounded-r-lg 
                  prose-blockquote:!text-gray-900
                  prose-ul:!text-gray-900 
                  prose-ol:!text-gray-900
                  prose-li:!text-gray-900
                  prose-h1:!text-gray-900
                  prose-h2:!text-gray-900
                  prose-h3:!text-gray-900
                  prose-h4:!text-gray-900
                  prose-em:!text-gray-800
                  prose-a:!text-blue-600
                  [&>*]:!text-gray-900"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* CTA Section */}
            <div className="bg-slate-50 p-8 text-center">
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                Ready to Optimize Your Resume?
              </h3>
              <p className="text-slate-600 mb-6">
                Use our AI-powered analyzer to implement these tips and improve your resume
              </p>
              <Link
                href="/resume-analysis"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Analyze My Resume
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            </div>
          </article>

          {/* Navigation */}
          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}