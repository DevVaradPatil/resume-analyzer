'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Hook for checking feature access and handling limits
 */
export function useFeatureAccess() {
  const { isSignedIn } = useUser();
  const [isChecking, setIsChecking] = useState(false);

  const checkAccess = useCallback(async (featureType, fileSize = 0) => {
    if (!isSignedIn) {
      return {
        canUse: false,
        reason: 'NOT_SIGNED_IN',
        message: 'Please sign in to use this feature',
      };
    }

    setIsChecking(true);
    
    try {
      const response = await fetch('/api/subscription/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featureType, fileSize }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return data.data;
      } else {
        return {
          canUse: false,
          reason: 'ERROR',
          message: data.error || 'Error checking access',
        };
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        canUse: false,
        reason: 'ERROR',
        message: 'Error checking access',
      };
    } finally {
      setIsChecking(false);
    }
  }, [isSignedIn]);

  return {
    checkAccess,
    isChecking,
  };
}

/**
 * Hook for getting subscription status
 */
export function useSubscriptionStatus() {
  const { isSignedIn } = useUser();
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    if (!isSignedIn) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();

      if (data.status === 'success') {
        setStatus(data.data);
        return data.data;
      } else {
        setError(data.error);
        return null;
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  return {
    status,
    isLoading,
    error,
    fetchStatus,
  };
}
