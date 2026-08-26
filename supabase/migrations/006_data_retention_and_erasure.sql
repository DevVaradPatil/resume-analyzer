-- Migration: Data retention and erasure
-- Run this migration in your Supabase SQL Editor, after 005.
--
-- Addresses improvement-plan item 8: resumes are dense personal data (names,
-- phone numbers, addresses, employment history) and were stored indefinitely
-- with no way for a user to delete them.
--
-- ============================================================================
-- WARNING: THIS MIGRATION IS DESTRUCTIVE.
--
-- Step 1 permanently drops resume_analysis_logs.raw_input, including every
-- value already stored in it. That is the intent -- it is duplicated personal
-- data -- but it cannot be undone. Take a backup first if you want one.
-- ============================================================================

-- ===========================================
-- 1. STOP STORING A SECOND COPY OF THE RESUME
-- ===========================================
-- raw_input held the first 5,000 characters of the resume, duplicating
-- resumes.content for no operational benefit: nothing in the application ever
-- read it back. Dropping the column removes the copy and prevents it being
-- reintroduced by accident.
--
-- The diagnostic value of the logs (which model, how long, success/failure,
-- error message) is unaffected.

ALTER TABLE resume_analysis_logs DROP COLUMN IF EXISTS raw_input;

-- ===========================================
-- 2. RETENTION
-- ===========================================
-- Deletes resumes older than the retention window. resume_analysis_logs rows
-- referencing them go too, via ON DELETE CASCADE on resume_id.
--
-- Returns the number of resumes removed so a scheduled run can be monitored.

CREATE OR REPLACE FUNCTION purge_expired_resumes(p_retention_days INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  IF p_retention_days IS NULL OR p_retention_days < 1 THEN
    RAISE EXCEPTION 'p_retention_days must be >= 1, got %', p_retention_days;
  END IF;

  WITH removed AS (
    DELETE FROM resumes
     WHERE created_at < NOW() - make_interval(days => p_retention_days)
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM removed;

  -- Logs are also written without a resume_id when an analysis fails before a
  -- resume row exists; those would otherwise never be collected.
  DELETE FROM resume_analysis_logs
   WHERE resume_id IS NULL
     AND created_at < NOW() - make_interval(days => p_retention_days);

  RETURN v_deleted;
END;
$$;

-- Schedule it daily if pg_cron is available on this project. Supabase exposes
-- pg_cron on paid plans and on free projects where the extension is enabled;
-- when it is not present this block is a no-op and the function must be run
-- manually (or from an external scheduler) instead.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('purge-expired-resumes')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-expired-resumes');

    PERFORM cron.schedule(
      'purge-expired-resumes',
      '30 3 * * *',                       -- 03:30 UTC daily
      $cron$ SELECT purge_expired_resumes(365); $cron$
    );

    RAISE NOTICE 'Scheduled purge-expired-resumes via pg_cron.';
  ELSE
    RAISE NOTICE 'pg_cron not installed - run purge_expired_resumes(365) on a schedule yourself.';
  END IF;
END;
$$;

-- ===========================================
-- 3. ERASURE SUPPORT
-- ===========================================
-- Deletes everything a user's account holds analysis-side, in one statement,
-- for the "delete all my data" control in the dashboard.
--
-- Scoped by clerk_user_id and resolved to users.id internally so a caller
-- cannot pass someone else's UUID.

CREATE OR REPLACE FUNCTION delete_user_analysis_data(p_clerk_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_deleted INTEGER;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE clerk_user_id = p_clerk_user_id;

  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  WITH removed AS (
    DELETE FROM resumes WHERE user_id = v_user_id RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM removed;

  -- Catches logs not attached to a resume.
  DELETE FROM resume_analysis_logs WHERE user_id = v_user_id;

  RETURN v_deleted;
END;
$$;

-- Retention queries filter on created_at across the whole table, so back that
-- with an index rather than relying on the existing per-user ones.
CREATE INDEX IF NOT EXISTS idx_resumes_created_at_retention
  ON resumes(created_at);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_logs_created_at_retention
  ON resume_analysis_logs(created_at);
