'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  ADSENSE_PUBLISHER_ID, 
  AD_SLOTS, 
  AD_CONFIG, 
  isTestMode,
  isDevelopment 
} from '../../lib/adsense-config';

/**
 * Base AdSense Ad Component with lazy loading
 * 
 * @param {Object} props
 * @param {string} props.slot - Ad slot ID
 * @param {string} props.format - Ad format: 'auto', 'fluid', 'rectangle', 'horizontal', 'vertical'
 * @param {boolean} props.responsive - Whether the ad should be responsive
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
export function AdUnit({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = '',
  style = {},
  testLabel = 'Ad'
}) {
  const adRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!AD_CONFIG.lazyLoad.enabled) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: AD_CONFIG.lazyLoad.rootMargin,
        threshold: AD_CONFIG.lazyLoad.threshold,
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load ad when visible
  useEffect(() => {
    if (!isVisible || isLoaded) return;
    if (!AD_CONFIG.enabled && !isTestMode) return;

    // In test mode, don't load actual ads
    if (isTestMode) {
      setIsLoaded(true);
      return;
    }

    try {
      // Push the ad to AdSense
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [isVisible, isLoaded]);

  // Don't render if ads are disabled
  if (!AD_CONFIG.enabled && !isTestMode) {
    return null;
  }

  // Test mode placeholder
  if (isTestMode) {
    return (
      <div 
        ref={adRef}
        className={`bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-500 text-sm ${className}`}
        style={{ 
          minHeight: format === 'horizontal' ? '90px' : format === 'rectangle' ? '250px' : '100px',
          ...style 
        }}
      >
        <div className="text-center p-4">
          <div className="font-medium">{testLabel}</div>
          <div className="text-xs text-slate-400">Slot: {slot}</div>
          {isDevelopment && (
            <div className="text-xs text-amber-500 mt-1">Test Mode - Ads disabled in development</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={className} style={style}>
      {isVisible && (
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            ...style,
          }}
          data-ad-client={ADSENSE_PUBLISHER_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      )}
    </div>
  );
}

/**
 * Header Banner Ad (728x90 or responsive)
 * Best for: Top of page, below navigation
 */
export function HeaderBannerAd({ className = '' }) {
  if (!AD_CONFIG.placements.header.enabled) return null;
  
  return (
    <div className={`w-full flex justify-center py-2 ${className}`}>
      <AdUnit 
        slot={AD_SLOTS.HEADER_BANNER}
        format="horizontal"
        testLabel="Header Banner Ad (728x90)"
        className="max-w-4xl w-full"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
}

/**
 * Sidebar Ad (300x250 or 300x600)
 * Best for: Desktop sidebar, sticky positioning
 */
export function SidebarAd({ className = '', variant = 'medium' }) {
  if (!AD_CONFIG.placements.sidebar.enabled) return null;
  
  const height = variant === 'tall' ? '600px' : '250px';
  
  return (
    <div className={`hidden lg:block ${className}`}>
      <AdUnit 
        slot={AD_SLOTS.SIDEBAR}
        format="rectangle"
        responsive={false}
        testLabel={`Sidebar Ad (300x${variant === 'tall' ? '600' : '250'})`}
        style={{ width: '300px', minHeight: height }}
      />
    </div>
  );
}

/**
 * In-Article/In-Content Ad (fluid/responsive)
 * Best for: Between content sections, blog posts
 */
export function InArticleAd({ className = '' }) {
  if (!AD_CONFIG.placements.inArticle.enabled) return null;
  
  return (
    <div className={`my-6 ${className}`}>
      <AdUnit 
        slot={AD_SLOTS.IN_ARTICLE}
        format="fluid"
        testLabel="In-Article Ad (Fluid)"
        className="w-full"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
}

/**
 * Footer Banner Ad (728x90 or responsive)
 * Best for: Above footer, end of content
 */
export function FooterBannerAd({ className = '' }) {
  if (!AD_CONFIG.placements.footer.enabled) return null;
  
  return (
    <div className={`w-full flex justify-center py-4 bg-slate-50 ${className}`}>
      <AdUnit 
        slot={AD_SLOTS.FOOTER_BANNER}
        format="horizontal"
        testLabel="Footer Banner Ad (728x90)"
        className="max-w-4xl w-full"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
}

/**
 * Results Page Ad (responsive rectangle)
 * Best for: After analysis results, before action buttons
 */
export function ResultsAd({ className = '' }) {
  if (!AD_CONFIG.placements.results.enabled) return null;
  
  return (
    <div className={`my-6 flex justify-center ${className}`}>
      <AdUnit 
        slot={AD_SLOTS.RESULTS_AD}
        format="rectangle"
        testLabel="Results Ad (300x250)"
        style={{ minWidth: '300px', minHeight: '250px' }}
      />
    </div>
  );
}

/**
 * In-Feed Native Ad
 * Best for: Blog listing, article feeds
 */
export function InFeedAd({ className = '' }) {
  if (!AD_CONFIG.placements.inFeed.enabled) return null;
  
  return (
    <div className={`my-4 ${className}`}>
      <AdUnit 
        slot={AD_SLOTS.IN_FEED}
        format="fluid"
        testLabel="In-Feed Native Ad"
        className="w-full"
        style={{ minHeight: '120px' }}
      />
    </div>
  );
}

/**
 * Multiplex Ad (grid of related content ads)
 * Best for: End of articles, recommendation sections
 */
export function MultiplexAd({ className = '' }) {
  return (
    <div className={`my-6 ${className}`}>
      <AdUnit 
        slot={AD_SLOTS.IN_ARTICLE}
        format="autorelaxed"
        testLabel="Multiplex Ad (Related Content)"
        className="w-full"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}

export default AdUnit;
