'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AD_CONFIG } from '../../lib/adsense-config';

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
  const [adState, setAdState] = useState({
    showAds: true,
    userTier: 'free',
    isLoading: true,
  });

  useEffect(() => {
    async function checkSubscription() {
      if (!isUserLoaded) return;

      // If no user, show ads (anonymous users)
      if (!user) {
        setAdState({
          showAds: true,
          userTier: 'free',
          isLoading: false,
        });
        return;
      }

      try {
        // Check user's subscription status
        const response = await fetch('/api/subscription/status');
        
        if (response.ok) {
          const data = await response.json();
          const tier = data.subscription?.tier || 'free';
          
          // Show ads only to free tier users (if configured)
          const showAds = AD_CONFIG.showOnlyToFreeUsers 
            ? tier === 'free' 
            : true;
          
          setAdState({
            showAds,
            userTier: tier,
            isLoading: false,
          });
        } else {
          // Default to showing ads if subscription check fails
          setAdState({
            showAds: true,
            userTier: 'free',
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking subscription for ads:', error);
        setAdState({
          showAds: true,
          userTier: 'free',
          isLoading: false,
        });
      }
    }

    checkSubscription();
  }, [user, isUserLoaded]);

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

  return <div className={className}>{children}</div>;
}

export default AdProvider;
