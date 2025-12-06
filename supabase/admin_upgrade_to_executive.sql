-- =====================================================
-- Quick Admin Query: Upgrade User to Executive Tier
-- =====================================================
-- This script upgrades a user to Executive tier for free
-- Run this in Supabase SQL Editor
-- =====================================================

-- Replace 'YOUR_CLERK_USER_ID_HERE' with your actual Clerk User ID

-- Step 1: Insert or update subscription record
INSERT INTO user_subscriptions (
  clerk_user_id, 
  tier, 
  status, 
  current_period_start, 
  current_period_end,
  payment_provider
)
VALUES (
  'YOUR_CLERK_USER_ID_HERE',  -- Replace with your Clerk User ID
  'executive',                 -- Executive tier
  'active',                    -- Active status
  NOW(),                       -- Start now
  NOW() + INTERVAL '100 years', -- Never expires (effectively lifetime)
  'manual'                     -- Manual/free subscription
)
ON CONFLICT (clerk_user_id) 
DO UPDATE SET
  tier = 'executive',
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '100 years',
  payment_provider = 'manual',
  updated_at = NOW();

-- Step 2: Verify the update
SELECT 
  clerk_user_id,
  tier,
  status,
  current_period_end,
  payment_provider,
  created_at,
  updated_at
FROM user_subscriptions
WHERE clerk_user_id = 'user_36Sb7DcOPzbRoTxjnBLWeT8fh9F';  -- Replace with your Clerk User ID

-- Step 3: Check current usage (optional)
SELECT 
  feature_type,
  usage_period,
  usage_count
FROM feature_usage
WHERE clerk_user_id = 'user_36Sb7DcOPzbRoTxjnBLWeT8fh9F'  -- Replace with your Clerk User ID
ORDER BY usage_period DESC, feature_type;
