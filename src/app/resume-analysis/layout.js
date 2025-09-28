export const metadata = {
  title: 'Resume Analysis - Upload & Analyze Your Resume | ResumeInsight',
  description: 'Get detailed AI-powered analysis of your resume. Upload your PDF resume and receive personalized feedback, ATS compatibility scores, and improvement suggestions.',
  keywords: [
    'resume analysis',
    'resume upload',
    'AI resume checker',
    'ATS compatibility',
    'resume feedback',
    'job application help'
  ],
  openGraph: {
    title: 'Resume Analysis - Upload & Analyze Your Resume',
    description: 'Get detailed AI-powered analysis of your resume with personalized feedback and improvement suggestions.',
    url: 'https://resumeinsight.vercel.app/resume-analysis',
    images: ['/assets/landing.png'],
  },
  alternates: {
    canonical: '/resume-analysis',
  },
};

export default function ResumeAnalysisLayout({ children }) {
  return children;
}