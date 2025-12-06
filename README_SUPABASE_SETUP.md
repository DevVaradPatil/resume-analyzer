# Supabase Setup Guide

This guide explains how to set up Supabase as the database for the Resume Analyzer application.

## Overview

This project uses **Supabase only as a database** (PostgreSQL). Authentication is handled by **Clerk**, not Supabase Auth.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account
2. Click **New Project**
3. Fill in the project details:
   - **Name**: `resume-analyzer` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to your users
4. Click **Create new project** and wait for it to be ready

## 2. Run the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase/schema.sql` from this repository
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** to execute the schema

This will create:
- `users` table - Stores user information synced from Clerk
- `resumes` table - Stores uploaded resumes and analysis results
- `resume_analysis_logs` table - Logs each analysis operation
- Row Level Security (RLS) policies for data isolation
- Helper functions for common queries
- Triggers for automatic `updated_at` timestamps

## 3. Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **IMPORTANT**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It bypasses RLS!

## 4. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema

### Users Table

Stores user profiles synced from Clerk:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `clerk_user_id` | TEXT | Clerk's user ID (unique) |
| `email` | TEXT | User's email address |
| `name` | TEXT | Full name |
| `avatar_url` | TEXT | Profile picture URL |
| `role` | TEXT | USER or ADMIN |
| `plan` | TEXT | FREE, PRO, or ENTERPRISE |
| `subscription_status` | TEXT | NONE, ACTIVE, CANCELED, TRIALING |
| `subscription_renews_at` | TIMESTAMPTZ | When subscription renews |
| `billing_customer_id` | TEXT | Payment provider customer ID |
| `billing_subscription_id` | TEXT | Payment provider subscription ID |
| `created_at` | TIMESTAMPTZ | When user was created |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Resumes Table

Stores uploaded resumes and their analysis:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `file_name` | TEXT | Original file name |
| `file_url` | TEXT | Remote file URL (if applicable) |
| `content` | TEXT | Extracted text content |
| `analysis_result` | JSONB | Full analysis from Gemini |
| `analysis_type` | TEXT | job_match, overall, or section_improvement |
| `job_description` | TEXT | Job description (for job match) |
| `score` | INTEGER | Main score for quick access |
| `created_at` | TIMESTAMPTZ | When resume was uploaded |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Resume Analysis Logs Table

Detailed logs of each analysis operation:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `resume_id` | UUID | Foreign key to resumes (optional) |
| `raw_input` | TEXT | Original resume text |
| `job_description` | TEXT | Job description (if provided) |
| `model_used` | TEXT | AI model used (e.g., gemini-2.5-flash) |
| `tokens_used` | INTEGER | Tokens consumed |
| `analysis_type` | TEXT | Type of analysis |
| `section_type` | TEXT | Section type (for section improvement) |
| `success` | BOOLEAN | Whether analysis succeeded |
| `error_message` | TEXT | Error message if failed |
| `duration_ms` | INTEGER | Time taken in milliseconds |
| `created_at` | TIMESTAMPTZ | When analysis was performed |

## Row Level Security (RLS)

RLS is enabled on all tables to ensure users can only access their own data.

### How It Works

1. Since we use Clerk for auth (not Supabase Auth), RLS policies check the `clerk_user_id`
2. Server-side code uses the **service role key** which bypasses RLS for admin operations
3. The anon key respects RLS policies

### Policies Summary

- **Users**: Can only SELECT and UPDATE their own profile
- **Resumes**: Can SELECT, INSERT, UPDATE, DELETE only their own resumes
- **Logs**: Can SELECT, INSERT, DELETE only their own logs

## When to Use Which Key

### Anon Key (`SUPABASE_ANON_KEY`)

Use when:
- Making queries that should respect RLS
- Client-side queries (though we recommend server-side only)

### Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

Use when:
- Webhook handlers (Clerk user sync)
- Admin operations
- Creating/updating user records from server
- Any operation that needs to bypass RLS

**Always use server-side only!**

## Helper Functions

The schema includes PostgreSQL functions for common operations:

```sql
-- Get user by Clerk ID
SELECT * FROM get_user_by_clerk_id('clerk_user_id');

-- Get user's resume count
SELECT get_user_resume_count('clerk_user_id');

-- Get recent analyses
SELECT * FROM get_user_recent_analyses('clerk_user_id', 10);
```

## Troubleshooting

### "Missing environment variable" errors

Make sure all three environment variables are set in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### RLS blocking queries

If queries return empty when they shouldn't:
1. Check if you're using the correct key (service role for admin ops)
2. Verify the `clerk_user_id` matches the user record
3. Check the RLS policies in Supabase dashboard under **Authentication > Policies**

### User not syncing from Clerk

1. Verify the Clerk webhook is set up correctly (see `README_AUTH_CLERK_SETUP.md`)
2. Check the webhook secret is correct
3. Look at the API logs in Vercel or your hosting platform

## Security Best Practices

1. **Never expose service role key** - Only use server-side
2. **Use RLS policies** - Already configured in schema
3. **Validate user ownership** - Always check `user_id` matches before operations
4. **Limit stored data** - We truncate raw text to prevent bloat
5. **Use prepared statements** - Supabase client handles this automatically
