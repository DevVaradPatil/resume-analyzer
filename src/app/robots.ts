import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration following Vercel best practices
 * Controls search engine crawling behavior
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://resumeinsight.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/sign-in/',
          '/sign-up/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
