-- Migration: Payment integrity + atomic usage accounting
-- Run this migration in your Supabase SQL Editor, after 004.
--
-- Addresses:
--   1. Tier escalation / payment replay (payment_transactions)
--   2. Subscription expiry (status value 'expired')
--   3. Quota bypass via concurrent requests (consume/refund functions)

-- ===========================================
-- 1. PAYMENT TRANSACTIONS
-- ===========================================
-- One row per successfully verified Razorpay payment. The UNIQUE constraint on
-- razorpay_payment_id is what makes replaying a captured payment impossible:
-- a second verification attempt for the same payment id fails the insert.

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,

  -- Razorpay identifiers. payment_id is the replay guard.
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  razorpay_order_id TEXT NOT NULL,

  -- Tier and amount as read back from the Razorpay ORDER (server-authoritative),
  -- never from the client request body.
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'executive')),
  amount INTEGER NOT NULL,          -- in paise
  currency TEXT NOT NULL DEFAULT 'INR',

  -- Subscription window this payment purchased
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_clerk_user_id
  ON payment_transactions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id
  ON payment_transactions(razorpay_order_id);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payment_transactions;
CREATE POLICY "Users can view own payments" ON payment_transactions
  FOR SELECT
  USING (
    clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
    OR current_setting('role', true) = 'service_role'
  );

-- ===========================================
-- 2. SUBSCRIPTION STATUS: allow 'expired'
-- ===========================================
-- Lazy expiry downgrades a lapsed paid subscription to the free tier and marks
-- it 'expired', which the original CHECK constraint did not permit.

ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;
ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_status_check
  CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'expired'));

-- ===========================================
-- 3. ATOMIC FEATURE USAGE
-- ===========================================
-- The previous flow was: SELECT usage_count -> compare to limit -> UPDATE.
-- Concurrent requests all read the same pre-increment value and all passed the
-- check. These functions collapse check-and-increment into one statement so the
-- unique index on (clerk_user_id, feature_type, usage_period) serialises them.

-- Reserve one unit of quota.
--
-- Returns the new usage count if the reservation succeeded, or NULL if the
-- caller is already at their limit (the guarded UPDATE matches no row, so the
-- statement returns no rows, and a scalar SQL function yields NULL).
--
-- Scalar return rather than RETURNS TABLE: an OUT column named usage_count
-- would collide with the column of the same name inside the body.
--
-- p_limit semantics: -1 means unlimited (always allowed, still counted).
-- p_limit = 0 must be rejected by the caller; the INSERT path below would
-- otherwise create a first row regardless of the limit.
CREATE OR REPLACE FUNCTION consume_feature_usage(
  p_clerk_user_id TEXT,
  p_feature_type  TEXT,
  p_usage_period  TEXT,
  p_limit         INTEGER,
  p_metadata      JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER
LANGUAGE sql
AS $$
  INSERT INTO feature_usage AS fu (
    clerk_user_id, feature_type, usage_period, usage_count, metadata,
    first_used_at, last_used_at
  )
  VALUES (
    p_clerk_user_id, p_feature_type, p_usage_period, 1, p_metadata,
    NOW(), NOW()
  )
  ON CONFLICT (clerk_user_id, feature_type, usage_period) DO UPDATE
    SET usage_count  = fu.usage_count + 1,
        last_used_at = NOW(),
        metadata     = fu.metadata || p_metadata
    -- The guard: the UPDATE is skipped entirely when the caller is at their
    -- limit, and RETURNING then yields no row.
    WHERE p_limit = -1 OR fu.usage_count < p_limit
  RETURNING fu.usage_count;
$$;

-- Give back one unit of quota when the work the reservation paid for failed.
-- Floored at zero so repeated refunds cannot mint quota.
CREATE OR REPLACE FUNCTION refund_feature_usage(
  p_clerk_user_id TEXT,
  p_feature_type  TEXT,
  p_usage_period  TEXT
)
RETURNS INTEGER
LANGUAGE sql
AS $$
  UPDATE feature_usage AS fu
     SET usage_count = GREATEST(fu.usage_count - 1, 0)
   WHERE fu.clerk_user_id = p_clerk_user_id
     AND fu.feature_type  = p_feature_type
     AND fu.usage_period  = p_usage_period
  RETURNING fu.usage_count;
$$;
