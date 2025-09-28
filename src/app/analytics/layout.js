export const metadata = {
  title: 'Resume Analytics - Overall Resume Analysis | ResumeInsight',
  description: 'Get comprehensive analytics and insights about your resume. Analyze overall performance, identify strengths and weaknesses, and get detailed improvement recommendations.',
  keywords: [
    'resume analytics',
    'resume insights',
    'overall analysis',
    'resume performance',
    'career insights'
  ],
  openGraph: {
    title: 'Resume Analytics - Overall Resume Analysis',
    description: 'Get comprehensive analytics and insights about your resume performance.',
    url: 'https://resumeinsight.vercel.app/analytics',
    images: ['/assets/landing.png'],
  },
  alternates: {
    canonical: '/analytics',
  },
};

export default function AnalyticsLayout({ children }) {
  return children;
}