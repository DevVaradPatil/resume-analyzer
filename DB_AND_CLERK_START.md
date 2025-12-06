You are an expert in **Next.js**, **Supabase (Postgres)**, and **Clerk**.

I have an existing **Next.js resume analyzer** project in this repository with **no database** and **no auth** currently wired up. Your job is to:

---

## 1. Analyze the existing project

1. Detect whether the app is using:
   - Next.js **App Router** (`app/` directory), or  
   - Next.js **Pages Router** (`pages/` directory).

2. Identify:
   - The main “logged-in” area (resume upload, analysis, dashboard).
   - Public / marketing pages (landing page, about, etc.).

Keep those in mind when wiring auth + database.

---

## 2. Set up Supabase as the database layer

I want to use **Supabase only as the database** (Postgres + RLS), not for auth. Clerk will be the auth provider.

### 2.1. Supabase client setup

1. Add a simple Supabase client for server-side usage:
   - Use `@supabase/supabase-js`.
   - Create a file like `lib/supabaseClient.ts` (or equivalent) that:
     - Reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` from environment variables.
     - Exports a properly typed `supabase` client instance for server-side use.
   - Make sure usage is compatible with the router type (App or Pages).

2. Do *not* use Supabase Auth. Only use Supabase as a Postgres DB.

### 2.2. Database schema for users and resume data

Create a SQL schema file in the repo, for example: `supabase/schema.sql`.

Define at least these tables:

1. **users**
   - `id` UUID primary key (default `gen_random_uuid()`).
   - `clerk_user_id` TEXT unique NOT NULL.
   - `email` TEXT NOT NULL.
   - `name` TEXT.
   - `avatar_url` TEXT.
   - `role` TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')).
   - `plan` TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')).
   - `subscription_status` TEXT DEFAULT 'NONE' CHECK (subscription_status IN ('NONE', 'ACTIVE', 'CANCELED', 'TRIALING')).
   - `subscription_renews_at` TIMESTAMPTZ NULL.
   - `billing_customer_id` TEXT NULL.
   - `billing_subscription_id` TEXT NULL.
   - `created_at` TIMESTAMPTZ DEFAULT now() NOT NULL.
   - `updated_at` TIMESTAMPTZ DEFAULT now() NOT NULL.

2. **resumes**
   - `id` UUID primary key.
   - `user_id` UUID REFERENCES users(id) ON DELETE CASCADE.
   - `file_name` TEXT NOT NULL.
   - `file_url` TEXT NOT NULL (if stored remotely) OR `content` TEXT (if stored as text).
   - `analysis_result` JSONB NULL.
   - `created_at` TIMESTAMPTZ DEFAULT now() NOT NULL.

3. (Optional, but helpful) **resume_analysis_logs**
   - `id` UUID primary key.
   - `user_id` UUID REFERENCES users(id) ON DELETE CASCADE.
   - `resume_id` UUID REFERENCES resumes(id) ON DELETE CASCADE.
   - `raw_input` TEXT.
   - `model_used` TEXT.
   - `tokens_used` INT.
   - `created_at` TIMESTAMPTZ DEFAULT now() NOT NULL.

### 2.3. Row Level Security (RLS)

In the same SQL file, enable RLS and add policies:

- Enable RLS on `users`, `resumes`, and `resume_analysis_logs`.
- For `users`:
  - Allow a user to `SELECT` and `UPDATE` only their row, based on `clerk_user_id`.
- For `resumes` and `resume_analysis_logs`:
  - Allow a user to `SELECT`/`INSERT`/`UPDATE`/`DELETE` rows where `user_id` maps back to their `users.id`.

Since we are using Clerk for auth, design the policies assuming that on the server we will query data using the `clerk_user_id` we get from Clerk.

### 2.4. Supabase setup README

Create a `README_SUPABASE_SETUP.md` with:

1. Steps to create a new Supabase project from the Supabase dashboard.
2. Directions to:
   - Open the SQL editor.
   - Paste and run `supabase/schema.sql`.
3. Environment variables required:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (only used on the server, never exposed to the browser).
4. Short explanation:
   - When to use ANON vs SERVICE ROLE key in this codebase.
   - That we are using **Supabase only for database**, not Supabase Auth.

---

## 3. Integrate Clerk for authentication

Now integrate **Clerk** as the auth provider.

### 3.1. Core Clerk setup

1. Install Clerk for Next.js and configure:
   - Add `ClerkProvider` in the correct root (`layout.tsx` for App Router or `_app.tsx` for Pages Router).
   - Create `/sign-in` and `/sign-up` routes/pages using Clerk components.
   - Add proper redirects:
     - After sign-in/sign-up, go to the main dashboard / resume analyzer page.
   - Create a **sign-out** mechanism (button/menu).

2. Add route protection:
   - Create or configure `middleware.ts` to protect all resume-related routes.
   - Leave landing/marketing pages **public**.
   - Based on router type, use:
     - App Router: protected route groups, `auth()`/`currentUser()`, etc.
     - Pages Router: HOC or wrappers for `getServerSideProps`, API routes, etc.

### 3.2. Environment variables for Clerk

- Expect in `.env.local`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - Any webhook secret(s) later if used.

Document these in a new file: `README_AUTH_CLERK_SETUP.md` (see section 5).

---

## 4. Sync Clerk users with Supabase users

Whenever a user signs in or signs up with Clerk, I want a corresponding row in Supabase `users`.

Implement one of these patterns (choose the most robust):

### Option A: Webhook-based sync (preferred)

1. Create an API route / server route for Clerk webhooks, e.g. `/api/webhooks/clerk`.
2. Configure Clerk to send webhooks (`user.created`, `user.updated`).
3. In the webhook handler:
   - Verify the webhook signature.
   - On `user.created`:
     - Insert a new row in `users` with:
       - `clerk_user_id`
       - `email`
       - `name`
       - `avatar_url`
   - On `user.updated`:
     - Update the existing `users` row with new email/name/avatar.
4. Use the **Supabase service role key** in the webhook handler to bypass RLS safely on the backend.

### Option B: On-demand sync at login (fallback / backup)

If you additionally want a guard on first page load:

1. Create a server-side helper:
   - Gets `clerkUserId` from `currentUser()` / `auth()`.
   - Checks if a `users` row exists for that `clerk_user_id`.
   - If not, creates it using Clerk’s user info (email/name/avatar).
2. Use this helper in:
   - Dashboard / resume analyzer page loader.
   - Any server actions that create resume records.

---

## 5. Protect routes, server actions, and data access

1. For all resume-related operations:
   - Upload.
   - Parsing.
   - Analysis saving.
   - Listing user history.
   Ensure they:
   - Use Clerk to get the `clerk_user_id`.
   - Resolve the corresponding `users.id` from Supabase.
   - Read/write `resumes` and `resume_analysis_logs` scoped to that `user_id`.

2. For example:
   - A server action `createResumeAnalysis` should:
     - Compute the current `clerk_user_id`.
     - Find or create the `users` record.
     - Insert into `resumes` and `resume_analysis_logs` with `user_id`.

3. Make sure:
   - Unauthenticated users **cannot** access any resume-related endpoints or server actions.
   - Authenticated users can only see their own data.

---

## 6. UX updates for authenticated experience

1. Navbar/header:
   - Show a user avatar, name/email (from Clerk).
   - Provide quick access to:
     - Dashboard / My Resumes.
     - Account/profile page.
     - Sign out.

2. Auth pages:
   - Use Clerk sign-in/sign-up with:
     - Email + password.
     - OAuth providers: **Google**, **GitHub**, **LinkedIn** (enable these in Clerk config, see README).

3. Redirect logic:
   - If a logged-in user tries to visit `/sign-in` or `/sign-up`, redirect them to the dashboard.
   - If a non-logged-in user tries to visit dashboard/resume pages, redirect them to sign-in.

---

## 7. Documentation

Create/Update these docs in the project root:

1. **`README_SUPABASE_SETUP.md`**
   - How to create Supabase project.
   - How to run `supabase/schema.sql`.
   - Explanation of tables (`users`, `resumes`, `resume_analysis_logs`).
   - Environment variables for Supabase.
   - Short note on RLS and how we enforce per-user data isolation.

2. **`README_AUTH_CLERK_SETUP.md`**
   - How to create a Clerk application.
   - How to enable OAuth providers: **Google**, **GitHub**, **LinkedIn**.
   - How to configure:
     - Allowed redirect URLs (sign-in, sign-up, dashboard).
     - Webhook (if using the webhook integration), including:
       - Which events to enable (`user.created`, `user.updated`).
       - The webhook URL from this project.
   - List all relevant environment variables.
   - Summary of route protection and login flow.

---

## 8. Non-breaking behavior

- Do not break the existing resume analyzer core logic.
- Refactor only what is necessary to:
  - Plug in Supabase for persistence.
  - Plug in Clerk for auth.
  - Scope data to each user.

At the end, I should have:

- A working Next.js app where:
  - **Supabase** is used as the persistent database.
  - **Clerk** handles authentication (email/password + Google/GitHub/LinkedIn).
  - Each user has their own stored resumes and history.
- Clear documentation on how to:
  - Set up Supabase.
  - Set up Clerk.
  - Configure environment variables.
  - Run the project locally.

Now, analyze this repository and implement all of the above.
