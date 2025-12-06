-- =====================================================
-- Migration: Remove Redundant Subscription Fields
-- =====================================================
-- This migration removes subscription fields from users table
-- since user_subscriptions table is the single source of truth
-- =====================================================

-- Drop unused subscription columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS plan;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_status;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_renews_at;
ALTER TABLE users DROP COLUMN IF EXISTS billing_customer_id;
ALTER TABLE users DROP COLUMN IF EXISTS billing_subscription_id;

-- Note: Keep role, email, name, avatar_url as they're user profile fields
-- Only subscription-related fields are removed
