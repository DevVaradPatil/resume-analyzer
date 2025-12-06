-- Migration: Add subscription and usage tracking tables
-- Run this migration in your Supabase SQL Editor

-- ===========================================
-- 1. CREATE USER SUBSCRIPTIONS TABLE
-- ===========================================
-- This table tracks each user's subscription tier and status

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'executive')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  
  -- Payment gateway fields (for future integration)
  payment_provider TEXT, -- 'stripe', 'paddle', 'razorpay', etc.
  payment_customer_id TEXT, -- Customer ID from payment provider
  payment_subscription_id TEXT, -- Subscription ID from payment provider
  
  -- Billing cycle
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Trial period (optional)
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by clerk_user_id
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_clerk_user_id ON user_subscriptions(clerk_user_id);

-- Index for finding active subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- ===========================================
-- 2. CREATE FEATURE USAGE TABLE
-- ===========================================
-- This table tracks feature usage for billing and limit enforcement

CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('analyze', 'analytics', 'improve')),
  
  -- Usage period (monthly reset)
  usage_period TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2024-01')
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata for each usage
  metadata JSONB DEFAULT '{}', -- Stores additional data like file names, scores, etc.
  
  -- Timestamps
  first_used_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one record per user per feature per period
  UNIQUE(clerk_user_id, feature_type, usage_period)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_feature_usage_clerk_user_id ON feature_usage(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_period ON feature_usage(usage_period);
CREATE INDEX IF NOT EXISTS idx_feature_usage_lookup ON feature_usage(clerk_user_id, feature_type, usage_period);

-- ===========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 4. CREATE RLS POLICIES
-- ===========================================

-- User Subscriptions Policies
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role (backend) can manage all subscriptions
CREATE POLICY "Service can manage subscriptions" ON user_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow insert for creating new subscriptions
CREATE POLICY "Allow subscription creation" ON user_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Feature Usage Policies
-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON feature_usage
  FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role (backend) can manage all usage records
CREATE POLICY "Service can manage usage" ON feature_usage
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow insert/update for tracking usage
CREATE POLICY "Allow usage tracking" ON feature_usage
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow usage update" ON feature_usage
  FOR UPDATE
  USING (true);

-- ===========================================
-- 5. CREATE UPDATED_AT TRIGGER
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- ===========================================
-- 6. CREATE HELPER FUNCTIONS
-- ===========================================

-- Function to get current usage period (YYYY-MM format)
CREATE OR REPLACE FUNCTION get_current_usage_period()
RETURNS TEXT AS $$
BEGIN
  RETURN TO_CHAR(NOW(), 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- Function to get or create user subscription
CREATE OR REPLACE FUNCTION get_or_create_subscription(p_clerk_user_id TEXT)
RETURNS user_subscriptions AS $$
DECLARE
  v_subscription user_subscriptions;
BEGIN
  -- Try to find existing subscription
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE clerk_user_id = p_clerk_user_id;
  
  -- If not found, create a new free subscription
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (clerk_user_id, tier, status)
    VALUES (p_clerk_user_id, 'free', 'active')
    RETURNING * INTO v_subscription;
  END IF;
  
  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_clerk_user_id TEXT,
  p_feature_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS feature_usage AS $$
DECLARE
  v_usage_period TEXT;
  v_usage feature_usage;
BEGIN
  -- Get current period
  v_usage_period := get_current_usage_period();
  
  -- Upsert the usage record
  INSERT INTO feature_usage (clerk_user_id, feature_type, usage_period, usage_count, metadata)
  VALUES (p_clerk_user_id, p_feature_type, v_usage_period, 1, p_metadata)
  ON CONFLICT (clerk_user_id, feature_type, usage_period)
  DO UPDATE SET
    usage_count = feature_usage.usage_count + 1,
    last_used_at = NOW(),
    metadata = feature_usage.metadata || p_metadata
  RETURNING * INTO v_usage;
  
  RETURN v_usage;
END;
$$ LANGUAGE plpgsql;

-- Function to get usage stats for a user
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_clerk_user_id TEXT)
RETURNS TABLE (
  feature_type TEXT,
  current_usage INTEGER,
  usage_period TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fu.feature_type,
    fu.usage_count AS current_usage,
    fu.usage_period
  FROM feature_usage fu
  WHERE fu.clerk_user_id = p_clerk_user_id
    AND fu.usage_period = get_current_usage_period();
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 7. GRANT PERMISSIONS
-- ===========================================

-- Grant permissions to authenticated users (for RLS policies)
GRANT SELECT ON user_subscriptions TO authenticated;
GRANT SELECT ON feature_usage TO authenticated;

-- Grant full permissions to service role
GRANT ALL ON user_subscriptions TO service_role;
GRANT ALL ON feature_usage TO service_role;

-- ===========================================
-- DONE!
-- ===========================================
-- 
-- After running this migration:
-- 1. The user_subscriptions table will track each user's subscription tier
-- 2. The feature_usage table will track usage per feature per month
-- 3. New users will automatically get a 'free' tier subscription
-- 4. Usage limits are enforced at the API level using the subscription-service.js
--
-- Tier Limits:
-- - Free: 1 use per feature per month, 2MB max file size
-- - Pro ($15/month): 50 uses per feature per month, 10MB max file size
-- - Executive ($49/month): Unlimited uses, 25MB max file size
