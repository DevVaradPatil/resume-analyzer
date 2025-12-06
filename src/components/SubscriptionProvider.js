'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import PricingModal from './PricingModal';

// Create context for subscription state
const SubscriptionContext = createContext(null);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default function SubscriptionProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkSubscription();
    } else if (isLoaded && !isSignedIn) {
      setIsCheckingSubscription(false);
    }
  }, [isLoaded, isSignedIn]);

  const checkSubscription = async () => {
    try {
      // Check if user has a subscription
      const initResponse = await fetch('/api/subscription/init');
      const initData = await initResponse.json();
      
      if (initData.status === 'success') {
        if (initData.data.needsOnboarding) {
          // Show pricing modal for new users
          setShowPricingModal(true);
        } else {
          // Get full subscription status
          await refreshSubscriptionStatus();
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      
      if (data.status === 'success') {
        setSubscriptionStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleTierSelected = async (tier) => {
    setHasCompletedOnboarding(true);
    setShowPricingModal(false);
    await refreshSubscriptionStatus();
  };

  const value = {
    subscriptionStatus,
    isCheckingSubscription,
    refreshSubscriptionStatus,
    hasCompletedOnboarding,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      
      {/* Onboarding Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal && !hasCompletedOnboarding}
        onClose={() => {
          // For onboarding, initialize with free tier when closing
          handleTierSelected('free');
        }}
        onSelectTier={handleTierSelected}
        isOnboarding={true}
      />
    </SubscriptionContext.Provider>
  );
}
