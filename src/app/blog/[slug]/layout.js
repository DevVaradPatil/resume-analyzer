import { getArticleMetadata } from '../../../lib/blog';

// Generate metadata for each blog post
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  const metadata = getArticleMetadata(slug);

  if (!metadata) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    // Explicit suffix: blog/layout.js sets a plain title, which resets the
    // root template for everything below it.
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
      images: ['/assets/product/og.png'],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default function BlogPostLayout({ children }) {
  return children;
}