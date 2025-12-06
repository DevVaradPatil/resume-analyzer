-- =============================================
-- Resume Analyzer Database Schema
-- =============================================
-- This schema creates the necessary tables for the Resume Analyzer application
-- using Supabase (Postgres) with Row Level Security (RLS).
-- 
-- IMPORTANT: Clerk is used for authentication, NOT Supabase Auth.
-- RLS policies are based on clerk_user_id passed from the server.
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE
-- =============================================
-- Stores user profile information synced from Clerk
-- Note: Subscription data is stored in user_subscriptions table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on clerk_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- RESUMES TABLE
-- =============================================
-- Stores uploaded resumes and their analysis results
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT, -- If stored remotely (e.g., Supabase Storage, S3)
    content TEXT, -- If stored as text (extracted PDF content)
    analysis_result JSONB NULL, -- Stores the JSON analysis from Gemini
    analysis_type TEXT DEFAULT 'job_match' CHECK (analysis_type IN ('job_match', 'overall', 'section_improvement')),
    job_description TEXT, -- For job match analysis
    score INTEGER, -- Quick access to the main score
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- =============================================
-- RESUME ANALYSIS LOGS TABLE
-- =============================================
-- Stores detailed logs of each analysis operation
CREATE TABLE IF NOT EXISTS resume_analysis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    raw_input TEXT, -- Original resume text
    job_description TEXT, -- Job description if provided
    model_used TEXT, -- e.g., 'gemini-1.5-flash'
    tokens_used INTEGER,
    analysis_type TEXT CHECK (analysis_type IN ('job_match', 'overall', 'section_improvement')),
    section_type TEXT, -- For section improvement: 'summary', 'experience', etc.
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms INTEGER, -- Time taken for analysis
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_resume_analysis_logs_user_id ON resume_analysis_logs(user_id);

-- Create index on resume_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_resume_analysis_logs_resume_id ON resume_analysis_logs(resume_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_resume_analysis_logs_created_at ON resume_analysis_logs(created_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
-- Automatically updates the updated_at column on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to resumes table
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR USERS TABLE
-- =============================================
-- Note: Since we use Clerk for auth, server-side code will pass clerk_user_id
-- via a custom header or function parameter. For service role, RLS is bypassed.

-- Allow users to read their own profile
-- This policy uses a function that checks the clerk_user_id header
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (
        clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        OR current_setting('role', true) = 'service_role'
    );

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (
        clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        OR current_setting('role', true) = 'service_role'
    );

-- Service role can insert new users (via webhook)
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT
    WITH CHECK (true); -- Webhook handlers use service role which bypasses RLS

-- =============================================
-- RLS POLICIES FOR RESUMES TABLE
-- =============================================
-- Allow users to read their own resumes
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
CREATE POLICY "Users can view own resumes" ON resumes
    FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        )
        OR current_setting('role', true) = 'service_role'
    );

-- Allow users to insert their own resumes
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
CREATE POLICY "Users can insert own resumes" ON resumes
    FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        )
        OR current_setting('role', true) = 'service_role'
    );

-- Allow users to update their own resumes
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
CREATE POLICY "Users can update own resumes" ON resumes
    FOR UPDATE
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        )
        OR current_setting('role', true) = 'service_role'
    );

-- Allow users to delete their own resumes
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
CREATE POLICY "Users can delete own resumes" ON resumes
    FOR DELETE
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        )
        OR current_setting('role', true) = 'service_role'
    );

-- =============================================
-- RLS POLICIES FOR RESUME_ANALYSIS_LOGS TABLE
-- =============================================
-- Allow users to read their own analysis logs
DROP POLICY IF EXISTS "Users can view own analysis logs" ON resume_analysis_logs;
CREATE POLICY "Users can view own analysis logs" ON resume_analysis_logs
    FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        )
        OR current_setting('role', true) = 'service_role'
    );

-- Allow users to insert their own analysis logs
DROP POLICY IF EXISTS "Users can insert own analysis logs" ON resume_analysis_logs;
CREATE POLICY "Users can insert own analysis logs" ON resume_analysis_logs
    FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        )
        OR current_setting('role', true) = 'service_role'
    );

-- Allow users to delete their own analysis logs
DROP POLICY IF EXISTS "Users can delete own analysis logs" ON resume_analysis_logs;
CREATE POLICY "Users can delete own analysis logs" ON resume_analysis_logs
    FOR DELETE
    USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
        )
        OR current_setting('role', true) = 'service_role'
    );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get user by clerk_user_id
CREATE OR REPLACE FUNCTION get_user_by_clerk_id(p_clerk_user_id TEXT)
RETURNS TABLE (
    id UUID,
    clerk_user_id TEXT,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.clerk_user_id,
        u.email,
        u.name,
        u.avatar_url,
        u.role,
        u.created_at
    FROM users u
    WHERE u.clerk_user_id = p_clerk_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's resume count
CREATE OR REPLACE FUNCTION get_user_resume_count(p_clerk_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    resume_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO resume_count
    FROM resumes r
    JOIN users u ON r.user_id = u.id
    WHERE u.clerk_user_id = p_clerk_user_id;
    
    RETURN resume_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's recent analyses
CREATE OR REPLACE FUNCTION get_user_recent_analyses(p_clerk_user_id TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    file_name TEXT,
    analysis_type TEXT,
    score INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.file_name,
        r.analysis_type,
        r.score,
        r.created_at
    FROM resumes r
    JOIN users u ON r.user_id = u.id
    WHERE u.clerk_user_id = p_clerk_user_id
    ORDER BY r.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SUBSCRIPTION TABLES
-- =============================================
-- Import subscription tables from migration 003
-- These tables are the ONLY source of subscription data

-- USER_SUBSCRIPTIONS TABLE (defined in migration 003_subscription_tables.sql)
-- Tracks user subscription tiers and billing
-- Fields: clerk_user_id, tier, status, payment_provider, current_period_end, etc.

-- FEATURE_USAGE TABLE (defined in migration 003_subscription_tables.sql)
-- Tracks feature usage counts per user per month
-- Fields: clerk_user_id, feature_type, usage_period, usage_count, etc.
