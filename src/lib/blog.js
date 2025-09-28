import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const articlesDirectory = path.join(process.cwd(), 'public', 'assets');

// Get all article slugs for static generation
export function getAllArticleSlugs() {
  const fileNames = fs.readdirSync(articlesDirectory);
  const mdFiles = fileNames.filter(name => name.endsWith('.md'));
  
  return mdFiles.map(fileName => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}

// Get article data by slug
export function getArticleBySlug(slug) {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Convert markdown to HTML
  const htmlContent = marked(content);
  
  return {
    slug,
    content: htmlContent,
    ...data,
  };
}

// Map article files to proper metadata
export function getArticleMetadata(slug) {
  const articleMap = {
    'article1': {
      title: '10 Essential Resume Keywords That Get You Noticed by ATS Systems',
      description: 'Discover the top 10 resume keywords that help you pass ATS filters and stand out to recruiters.',
      date: '2025-01-15',
      readTime: '5 min read',
      author: 'ResumeInsight',
      slug: 'ats-resume-keywords-2025'
    },
    'article2': {
      title: 'How to Optimize Your Resume for Remote Work Opportunities',
      description: 'Learn how to tailor your resume for remote jobs with essential keywords and skills.',
      date: '2025-01-10', 
      readTime: '7 min read',
      author: 'ResumeInsight',
      slug: 'remote-work-resume-optimization'
    },
    'article3': {
      title: 'The Ultimate Guide to Resume Formatting in 2025',
      description: 'Master modern resume formatting that works with both ATS systems and human recruiters.',
      date: '2025-01-05',
      readTime: '10 min read',
      author: 'ResumeInsight', 
      slug: 'resume-formatting-guide-2025'
    },
    'article4': {
      title: 'How AI is Changing Resume Screening: What You Need to Know',
      description: 'Understand how AI-powered recruitment tools work and optimize your resume for machine learning algorithms.',
      date: '2024-12-28',
      readTime: '6 min read',
      author: 'ResumeInsight',
      slug: 'ai-resume-screening-guide'
    }
  };

  return articleMap[slug] || null;
}

// Get all articles with metadata for blog listing
export function getAllArticles() {
  const slugs = getAllArticleSlugs();
  
  return slugs
    .map(({ slug }) => {
      const metadata = getArticleMetadata(slug);
      if (!metadata) return null;
      
      return {
        slug: metadata.slug,
        title: metadata.title,
        description: metadata.description,
        date: metadata.date,
        readTime: metadata.readTime,
        author: metadata.author
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}