export const metadata = {
  title: 'Resume Tips & Career Resources | ResumeInsight Blog',
  description: 'Expert advice on resume writing, job search strategies, and career development. Learn how to optimize your resume for ATS systems and land more interviews.',
  keywords: [
    'resume tips',
    'career advice',
    'job search',
    'ATS optimization',
    'interview preparation',
    'professional development'
  ],
  openGraph: {
    title: 'Resume Tips & Career Resources',
    description: 'Expert advice on resume writing and career development.',
    url: 'https://resumeinsight.vercel.app/blog',
    images: ['/assets/landing.png'],
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogLayout({ children }) {
  return children;
}