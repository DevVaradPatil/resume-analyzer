import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://resumeinsight.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://resumeinsight.vercel.app/resume-analysis',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://resumeinsight.vercel.app/analytics',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://resumeinsight.vercel.app/section-improvement',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://resumeinsight.vercel.app/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://resumeinsight.vercel.app/blog/ats-resume-keywords-2025',
      lastModified: new Date('2025-01-15'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://resumeinsight.vercel.app/blog/remote-work-resume-optimization',
      lastModified: new Date('2025-01-10'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://resumeinsight.vercel.app/blog/resume-formatting-guide-2025',
      lastModified: new Date('2025-01-05'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://resumeinsight.vercel.app/blog/ai-resume-screening-guide',
      lastModified: new Date('2024-12-28'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}