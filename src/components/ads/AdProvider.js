'use client';

import React, { createContext, useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import Script from 'next/script';
import { AD_CONFIG, ADSENSE_PUBLISHER_ID } from '../../lib/adsense-config';
import { useSubscription } from '../SubscriptionProvider';

// Context for ad visibility state
const AdContext = createContext({
  showAds: true,
  userTier: 'free',
  isLoading: true,
});

/**
 * AdProvider - Manages ad visibility based on user subscription
 * 
 * Free tier users see ads, paid users (Pro/Executive) get ad-free experience
 */
export function AdProvider({ children }) {
  const { user, isLoaded: isUserLoaded } = useUser();
  // Reads the status SubscriptionProvider already fetched, so a completed
  // payment hides ads as soon as that status refreshes, without a reload.
  const { subscriptionStatus, isCheckingSubscription } = useSubscription();

  const tier = subscriptionStatus?.subscription?.tier || 'free';
  const adState = {
    showAds: AD_CONFIG.showOnlyToFreeUsers ? tier === 'free' : true,
    userTier: tier,
    isLoading: !isUserLoaded || (Boolean(user) && isCheckingSubscription),
  };

  return (
    <AdContext.Provider value={adState}>
      {children}
    </AdContext.Provider>
  );
}

/**
 * Hook to access ad context
 */
export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}

/**
 * Wrapper component that only shows children (ads) to appropriate users
 */
export function AdWrapper({ children, className = '' }) {
  const { showAds, isLoading } = useAds();

  // Don't render anything while loading or if ads should be hidden
  if (isLoading || !showAds) {
    return null;
  }

  return (
    <div className={className}>
      {/* The AdSense script loads here rather than in the root layout, so it
          only reaches pages that render an ad unit (DESIGN.md 11.3, 15) and
          only for users who see ads. next/script dedupes it by id. */}
      {AD_CONFIG.enabled && (
        <Script
          id="adsbygoogle-js"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
      {children}
    </div>
  );
}

export default AdProvider;
