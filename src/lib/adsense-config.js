/**
 * Google AdSense Configuration
 * 
 * This module contains all AdSense configuration and ad unit definitions.
 * Replace the placeholder values with your actual AdSense publisher ID and ad slot IDs.
 */

// Your Google AdSense Publisher ID (format: ca-pub-XXXXXXXXXX)
// Get this from: https://www.google.com/adsense/ -> Account -> Account information
export const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXXX';

// Ad Unit Slot IDs - Create these in your AdSense account
// Go to: AdSense -> Ads -> By ad unit -> Create new ad unit
export const AD_SLOTS = {
  // Header banner (728x90 or responsive) - appears at top of pages
  HEADER_BANNER: process.env.NEXT_PUBLIC_AD_SLOT_HEADER || '1234567890',
  
  // Sidebar ad (300x250 or 300x600) - appears in sidebar on desktop
  SIDEBAR: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '2345678901',
  
  // In-article ad (responsive) - appears between content sections
  IN_ARTICLE: process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE || '3456789012',
  
  // Footer banner (728x90 or responsive) - appears at bottom before footer
  FOOTER_BANNER: process.env.NEXT_PUBLIC_AD_SLOT_FOOTER || '4567890123',
  
  // Results page ad (responsive) - appears after analysis results
  RESULTS_AD: process.env.NEXT_PUBLIC_AD_SLOT_RESULTS || '5678901234',
  
  // Native in-feed ad - blends with content listings
  IN_FEED: process.env.NEXT_PUBLIC_AD_SLOT_IN_FEED || '6789012345',
};

// Ad placement configuration
export const AD_CONFIG = {
  // Enable/disable ads globally (useful for development)
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  
  // Show ads only to free tier users (paid users get ad-free experience)
  showOnlyToFreeUsers: true,
  
  // Lazy loading settings
  lazyLoad: {
    enabled: true,
    rootMargin: '200px', // Load ads 200px before they come into view
    threshold: 0.1,
  },
  
  // Ad refresh settings (in milliseconds) - be careful with this, AdSense has policies
  refresh: {
    enabled: false, // Disabled by default - enable only if AdSense policy allows
    interval: 60000, // 60 seconds minimum if enabled
  },
  
  // Placements configuration
  placements: {
    header: {
      enabled: true,
      pages: ['home', 'blog', 'analytics'], // Pages where header ads appear
      format: 'horizontal', // horizontal, rectangle, vertical
    },
    sidebar: {
      enabled: true,
      pages: ['resume-analysis', 'analytics', 'section-improvement', 'blog'],
      format: 'rectangle',
    },
    inArticle: {
      enabled: true,
      pages: ['blog'],
      format: 'fluid',
    },
    footer: {
      enabled: true,
      pages: ['home', 'resume-analysis', 'analytics', 'section-improvement'],
      format: 'horizontal',
    },
    results: {
      enabled: true,
      pages: ['resume-analysis', 'analytics', 'section-improvement'],
      format: 'rectangle',
    },
    inFeed: {
      enabled: true,
      pages: ['blog'],
      format: 'in-feed',
    },
  },
};

// Ad sizes for different placements
export const AD_SIZES = {
  leaderboard: { width: 728, height: 90 },
  banner: { width: 468, height: 60 },
  mediumRectangle: { width: 300, height: 250 },
  largeRectangle: { width: 336, height: 280 },
  halfPage: { width: 300, height: 600 },
  responsive: { width: 'auto', height: 'auto' },
};

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';

// Test mode - shows placeholder ads in development
export const isTestMode = isDevelopment || process.env.NEXT_PUBLIC_AD_TEST_MODE === 'true';
