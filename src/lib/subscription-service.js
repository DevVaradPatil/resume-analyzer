import { getSupabaseAdminClient } from './supabaseClient';

/**
 * Subscription tier definitions
 */
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      analyze: 1,      // Job match analysis
      analytics: 1,    // Overall resume analytics
      improve: 1,      // Section improvement
      maxFileSize: 2 * 1024 * 1024, // 2MB
    },
    features: [
      '1 Job Match Analysis/month',
      '1 Resume Analytics/month',
      '1 Section Improvement/month',
      'Max 2MB file size',
      'Basic ATS scoring',
    ],
  },
  pro: {
    name: 'Pro',
    price: 5, // INR (Testing Price)
    limits: {
      analyze: 50,
      analytics: 50,
      improve: 50,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
    features: [
      '50 Job Match Analyses/month',
      '50 Resume Analytics/month',
      '50 Section Improvements/month',
      'Max 10MB file size',
      'Advanced ATS optimization',
      'Priority support',
      'Detailed industry insights',
    ],
  },
  executive: {
    name: 'Executive',
    price: 999, // INR
    limits: {
      analyze: -1, // unlimited
      analytics: -1,
      improve: -1,
      maxFileSize: 25 * 1024 * 1024, // 25MB
    },
    features: [
      'Unlimited Job Match Analyses',
      'Unlimited Resume Analytics',
      'Unlimited Section Improvements',
      'Max 25MB file size',
      'Premium ATS optimization',
      '24/7 Priority support',
      'Executive insights & benchmarks',
      'Custom recommendations',
    ],
  },
};

/**
 * Get current usage period string (YYYY-MM format)
 */
function getCurrentUsagePeriod() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Gets or creates a subscription for a user.
 * New users start with the free tier.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<Object>} The subscription data
 */
export async function getOrCreateSubscription(clerkUserId) {
  const supabase = getSupabaseAdminClient();
  
  // Check for existing subscription
  const { data: existingSubscription, error: selectError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (existingSubscription) {
    return existingSubscription;
  }
  
  // Create new subscription if not found (PGRST116 = not found)
  if (selectError && selectError.code === 'PGRST116') {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const { data: newSubscription, error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        clerk_user_id: clerkUserId,
        tier: 'free',
        status: 'active',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating subscription:', insertError);
      throw insertError;
    }
    
    return newSubscription;
  }
  
  if (selectError) {
    throw selectError;
  }
  
  return existingSubscription;
}

/**
 * Gets the current usage for a user in the current billing period.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<Object>} Usage counts by feature type
 */
export async function getCurrentUsage(clerkUserId) {
  const supabase = getSupabaseAdminClient();
  const usagePeriod = getCurrentUsagePeriod();
  
  // Get subscription to verify tier
  const subscription = await getOrCreateSubscription(clerkUserId);
  
  // Get usage records for current period
  const { data: usageData, error } = await supabase
    .from('feature_usage')
    .select('feature_type, usage_count')
    .eq('clerk_user_id', clerkUserId)
    .eq('usage_period', usagePeriod);
  
  if (error) {
    console.error('Error getting usage:', error);
    throw error;
  }
  
  // Build usage object
  const usage = {
    analyze: 0,
    analytics: 0,
    improve: 0,
  };
  
  usageData?.forEach((record) => {
    if (usage.hasOwnProperty(record.feature_type)) {
      usage[record.feature_type] = record.usage_count;
    }
  });
  
  return {
    usage,
    tier: subscription.tier,
    limits: SUBSCRIPTION_TIERS[subscription.tier].limits,
  };
}

/**
 * Checks if a user can use a specific feature based on their subscription.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {string} featureType - The feature type: 'analyze', 'analytics', 'improve'
 * @returns {Promise<Object>} Result with allowed flag and details
 */
export async function checkFeatureAccess(clerkUserId, featureType) {
  const supabase = getSupabaseAdminClient();
  const usagePeriod = getCurrentUsagePeriod();
  
  // Get subscription
  const subscription = await getOrCreateSubscription(clerkUserId);
  const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];
  
  if (!tierConfig) {
    return { allowed: false, reason: 'INVALID_TIER', message: 'Invalid subscription tier' };
  }
  
  // Check usage limit (-1 means unlimited)
  const featureLimit = tierConfig.limits[featureType];
  if (featureLimit === -1) {
    return { allowed: true, tier: subscription.tier, remaining: -1, limit: -1 };
  }
  
  // Get current usage for this feature
  const { data: usageRecord, error } = await supabase
    .from('feature_usage')
    .select('usage_count')
    .eq('clerk_user_id', clerkUserId)
    .eq('feature_type', featureType)
    .eq('usage_period', usagePeriod)
    .single();
  
  // Handle not found (no usage yet)
  const currentUsage = usageRecord?.usage_count || 0;
  const remaining = featureLimit - currentUsage;
  
  // Calculate reset date (first of next month)
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  if (currentUsage >= featureLimit) {
    return {
      allowed: false,
      reason: 'LIMIT_REACHED',
      message: `You've reached your monthly limit of ${featureLimit} for this feature. Upgrade your plan or wait until ${resetDate.toLocaleDateString()}.`,
      tier: subscription.tier,
      limit: featureLimit,
      used: currentUsage,
      remaining: 0,
      resetDate: resetDate.toISOString(),
    };
  }
  
  return {
    allowed: true,
    tier: subscription.tier,
    limit: featureLimit,
    used: currentUsage,
    remaining: remaining,
    resetDate: resetDate.toISOString(),
  };
}

/**
 * Checks file size against subscription limits.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {number} fileSize - File size in bytes
 * @returns {Promise<Object>} Result with allowed flag and details
 */
export async function checkFileSize(clerkUserId, fileSize) {
  const subscription = await getOrCreateSubscription(clerkUserId);
  const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];
  
  const maxSize = tierConfig.limits.maxFileSize;
  const maxSizeMB = maxSize / (1024 * 1024);
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  
  if (fileSize > maxSize) {
    return {
      allowed: false,
      message: `File size (${fileSizeMB}MB) exceeds the ${maxSizeMB}MB limit for ${tierConfig.name} tier. Upgrade to upload larger files.`,
      tier: subscription.tier,
      maxSize: maxSize,
      currentSize: fileSize,
    };
  }
  
  return {
    allowed: true,
    tier: subscription.tier,
    maxSize: maxSize,
    currentSize: fileSize,
  };
}

/**
 * Records usage of a feature (increments the usage counter).
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {string} featureType - The feature type: 'analyze', 'analytics', 'improve'
 * @param {Object} metadata - Optional metadata about the usage
 * @returns {Promise<Object>} The recorded/updated usage
 */
export async function recordFeatureUsage(clerkUserId, featureType, metadata = {}) {
  const supabase = getSupabaseAdminClient();
  const usagePeriod = getCurrentUsagePeriod();
  
  // Try to get existing usage record
  const { data: existingUsage, error: selectError } = await supabase
    .from('feature_usage')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .eq('feature_type', featureType)
    .eq('usage_period', usagePeriod)
    .single();
  
  if (existingUsage) {
    // Update existing record
    const { data, error } = await supabase
      .from('feature_usage')
      .update({
        usage_count: existingUsage.usage_count + 1,
        last_used_at: new Date().toISOString(),
        metadata: { ...existingUsage.metadata, ...metadata },
      })
      .eq('id', existingUsage.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating usage:', error);
      throw error;
    }
    
    return data;
  }
  
  // Create new usage record
  const { data, error } = await supabase
    .from('feature_usage')
    .insert({
      clerk_user_id: clerkUserId,
      feature_type: featureType,
      usage_period: usagePeriod,
      usage_count: 1,
      metadata: metadata,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error recording usage:', error);
    throw error;
  }
  
  return data;
}

/**
 * Gets full subscription status for a user including usage.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<Object>} Full subscription status
 */
export async function getSubscriptionStatus(clerkUserId) {
  const subscription = await getOrCreateSubscription(clerkUserId);
  const usageData = await getCurrentUsage(clerkUserId);
  const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];
  
  // Calculate reset date
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  return {
    subscription: {
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
    },
    tierConfig: tierConfig,
    usage: usageData.usage,
    limits: usageData.limits,
    remaining: {
      analyze: tierConfig.limits.analyze === -1 ? -1 : Math.max(0, tierConfig.limits.analyze - usageData.usage.analyze),
      analytics: tierConfig.limits.analytics === -1 ? -1 : Math.max(0, tierConfig.limits.analytics - usageData.usage.analytics),
      improve: tierConfig.limits.improve === -1 ? -1 : Math.max(0, tierConfig.limits.improve - usageData.usage.improve),
    },
    resetDate: resetDate.toISOString(),
  };
}

/**
 * Checks if user has a subscription record (for onboarding check).
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<boolean>} True if subscription exists
 */
export async function hasSubscription(clerkUserId) {
  const supabase = getSupabaseAdminClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error && error.code === 'PGRST116') {
    return false;
  }
  
  return !!data;
}

/**
 * Updates a user's subscription tier.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {string} newTier - The new tier: 'free', 'pro', 'executive'
 * @returns {Promise<Object>} The updated subscription
 */
export async function updateSubscriptionTier(clerkUserId, newTier) {
  const supabase = getSupabaseAdminClient();
  
  if (!SUBSCRIPTION_TIERS[newTier]) {
    throw new Error('Invalid subscription tier');
  }
  
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({
      tier: newTier,
      status: 'active',
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
  
  return data;
}

/**
 * Gets usage statistics for display.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<Object>} Usage statistics
 */
export async function getUsageStats(clerkUserId) {
  const status = await getSubscriptionStatus(clerkUserId);
  
  return {
    tier: status.subscription.tier,
    tierName: status.tierConfig.name,
    usage: status.usage,
    limits: status.limits,
    remaining: status.remaining,
    resetDate: status.resetDate,
    features: status.tierConfig.features,
  };
}
