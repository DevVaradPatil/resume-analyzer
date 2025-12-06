import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

/**
 * Reusable JSON-LD component for structured data
 * Renders schema.org markup for improved SEO
 * 
 * @param data - The structured data object to render
 * 
 * @example
 * <JsonLd data={{
 *   "@context": "https://schema.org",
 *   "@type": "Organization",
 *   "name": "ResumeInsight"
 * }} />
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
