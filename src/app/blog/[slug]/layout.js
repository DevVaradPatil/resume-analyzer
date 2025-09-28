import { getAllArticleSlugs, getArticleBySlug, getArticleMetadata } from '../../../lib/blog';

// Generate static params for all blog posts
export async function generateStaticParams() {
  return [
    { slug: 'ats-resume-keywords-2025' },
    { slug: 'remote-work-resume-optimization' },
    { slug: 'resume-formatting-guide-2025' },
    { slug: 'ai-resume-screening-guide' }
  ];
}

// Generate metadata for each blog post
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  // Find the article file that corresponds to this slug
  const articleMap = {
    'ats-resume-keywords-2025': 'article1',
    'remote-work-resume-optimization': 'article2',
    'resume-formatting-guide-2025': 'article3',
    'ai-resume-screening-guide': 'article4'
  };
  
  const articleFile = articleMap[slug];
  const metadata = getArticleMetadata(articleFile);
  
  if (!metadata) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${metadata.title} | ResumeInsight`,
    description: metadata.description,
    keywords: [
      'resume tips',
      'career advice',
      'job search',
      'ATS optimization',
      'resume optimization'
    ],
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://resumeinsight.vercel.app/blog/${slug}`,
      images: ['/assets/landing.png'],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default function BlogPostLayout({ children }) {
  return children;
}