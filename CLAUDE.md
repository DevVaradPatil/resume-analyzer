# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server on :3000
npm run build    # production build
npm start        # serve the production build
```

There is no lint script, no test runner, and no test files. "Testing" in this repo means running the app and exercising flows manually. Each AI route also exposes a `GET` handler that returns a health/env-check payload (e.g. `GET /api/analyze` reports whether `GOOGLE_API_KEY` is set) — useful for a quick smoke check without uploading a PDF.

Database changes are applied by hand: paste `supabase/schema.sql`, then `supabase/migrations/003_*.sql`, `004_*.sql`, `005_*.sql`, `006_*.sql` into the Supabase SQL Editor, in that order. There is no migration runner.

`006` is **destructive** — it drops `resume_analysis_logs.raw_input` and the data in it.

To validate a migration before applying it to Supabase, run it against a throwaway Postgres — this is how `005` was checked:

```bash
docker run -d --name ra-sqltest -e POSTGRES_PASSWORD=test -e POSTGRES_DB=ratest -p 55433:5432 postgres:16
```

Note that on Git Bash, `docker exec … psql -f /tmp/x.sql` needs `MSYS_NO_PATHCONV=1` or the container path gets rewritten to a Windows path.

## Environment variables

`.env.local` is the real file (all `.env*` are gitignored). **The README's env table is out of date — trust the code:**

- `GOOGLE_API_KEY` — Gemini key. Not `GEMINI_API_KEY`.
- `SUPABASE_ANON_KEY` — server-only, **not** `NEXT_PUBLIC_` prefixed (see `src/lib/supabaseClient.js`).
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_BASE_URL` — feeds `metadataBase`, sitemap, robots
- `NEXT_PUBLIC_ADS_ENABLED` (`'true'` to turn ads on), `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`, `NEXT_PUBLIC_AD_SLOT_*`

`.env.local.example` is closer to reality than `.env.example`.

## Architecture

Next.js 16 App Router, JS (`.js`) with JSX — TypeScript is installed and `tsconfig.json` exists, but only `JsonLd.tsx` and `robots.ts` use it. Path alias `@/*` → `./src/*` is configured, though most code uses relative imports. Tailwind v4 via `@tailwindcss/postcss`.

**`DESIGN.md` is the visual source of truth** (tokens, components, page composition, copy and trust rules). Read it before any UI change.

**The UI is light-only by decision.** There is not a single `dark:` variant in `src/`, and `globals.css` pins `color-scheme: light`. Do not reintroduce a `prefers-color-scheme: dark` block that only flips `body` — that was the previous state, and it rendered near-white text on hardcoded white cards for anyone whose device was in dark mode.

### Auth and identity: two IDs, always

Clerk is the auth source of truth; Supabase mirrors users. Two distinct identifiers coexist and are **not** interchangeable:

- `clerk_user_id` (TEXT, e.g. `user_2abc…`) — keyed directly by `user_subscriptions` and `feature_usage`.
- `users.id` (UUID) — the FK target for `resumes` and `resume_analysis_logs`.

Because of this split, every authenticated route calls `getOrCreateUser(...)` (`src/lib/user-sync.js`) before touching the DB, so the `users` row exists before anything FKs to it. `src/app/api/webhooks/clerk/route.js` (Svix-verified) keeps the mirror in sync on `user.created` / `user.updated` / `user.deleted`, but the routes do not rely on the webhook having fired.

`src/middleware.js` declares public routes (`/`, `/blog`, `/sign-in`, `/sign-up`, the Clerk webhook) and protects the feature pages plus `/api/analyze*`, `/api/improve-section`, `/api/dashboard`. Note that `/api/subscription/*` is *not* in the protected matcher — those routes do their own `auth()` check and return 401 themselves.

### Supabase access is server-side and service-role

`getSupabaseAdminClient()` (service role, bypasses RLS) is what essentially all app code uses. RLS policies in `schema.sql` are written against `current_setting('request.headers.x-clerk-user-id')` and only apply to the anon-key clients (`getSupabaseClient` / `getSupabaseClientWithAuth`), which are effectively unused. **Consequence: user-scoping is enforced in application code, not by the database.** Any new query must filter by the caller's user id explicitly.

### AI pipeline

`route → extractTextFromPdf → *WithGemini → parseGeminiResponse → record usage → persist`

- `src/lib/gemini-service.js` holds three functions (`analyzeResumeWithGemini`, `analyzeResumeOverallWithGemini`, `improveResumeSectionWithGemini`). Each instantiates `GoogleGenerativeAI` per call, uses `gemini-2.5-flash`, and embeds a large literal JSON template in the prompt describing the exact response shape. **That prompt template is the API contract** — the frontend pages read those exact nested keys, so changing a key means changing the prompt, the page, and any stored `analysis_result` readers together.
- `src/lib/pdf-extractor.js` wraps `pdf-parse`; `next.config.js` lists it in `serverExternalPackages` (required — do not remove).
- **The section rewrite prompt has truthfulness rules** (no added numbers, scale, outcomes, tools, or role inflation; square-bracket placeholders like `[X%]` instead). Users paste this text into real resumes, so keep those rules when editing the prompt. `SectionImprovementResults` highlights the placeholders and tells the user to replace them.
- `src/lib/response-parser.js` strips ``` fences and slices from the first `{` to the last `}`. It **never throws**: on failure it returns `{ status: 'error', error, raw_response }`. Callers must check `status` rather than assuming success.

### Subscription and quota enforcement

`src/lib/subscription-service.js` is the single source of truth. `SUBSCRIPTION_TIERS` (free / pro / executive) defines per-feature monthly limits, `maxFileSize`, price in INR, and marketing feature lists — the DB has a matching `CHECK (tier IN ('free','pro','executive'))`, so adding a tier requires a migration too. Limit `-1` means unlimited.

Feature keys are exactly `analyze` | `analytics` | `improve` (also a DB check constraint on `feature_usage.feature_type`). Usage is counted per `usage_period`, a `'YYYY-MM'` string — the monthly reset is implicit in the key changing, there is no reset job.

**Quota is reserved, not recorded.** Every AI route follows: `getOrCreateUser` → `checkFileSize` → validate the file → `consumeFeatureUsage` → do the work → persist, with `refundFeatureUsage` on *every* failure path after the reservation. `consumeFeatureUsage` calls the `consume_feature_usage` Postgres function, which checks the limit and increments in one statement — the previous check-then-increment pair let concurrent requests all pass the same check. Reserving up front and refunding on failure keeps the race closed without charging users for failures, so **any new early-return added after the reservation must refund**. `recordFeatureUsage`/`checkFeatureAccess` still exist but are deprecated and racy; `checkFeatureAccess` remains only as the read-only pre-flight behind `/api/subscription/check-access`.

**Subscription expiry is lazy.** `getOrCreateSubscription` downgrades a paid subscription whose `current_period_end` has passed to free/`expired` on read, so there is no cron. Paid periods run `PAID_PERIOD_DAYS` (30) from payment; renewing the same tier early stacks onto the remaining days.

**Never trust a client-supplied tier.** `verify-payment` reads the tier and owner back from the Razorpay *order*'s `notes` (written server-side by `create-order`), checks amount and captured status, and claims the `razorpay_payment_id` in `payment_transactions` — whose UNIQUE constraint is the replay guard — before granting anything. A duplicate insert surfaces as Postgres error `23505` and is returned as HTTP 409.

**Model output is untrusted shape.** The report components go through the guards in `src/components/results/index.js` (`asArray`, `asObject`, `toScore`), so a missing or wrongly-typed key drops one section instead of blanking the report. Keep new result markup on those guards.

**Error convention:** quota and size failures return HTTP 429 / 413 *and* a body `status` of `'LIMIT_REACHED'` / `'FILE_TOO_LARGE'`. The client pages (`resume-analysis`, `analytics`, `section-improvement`) branch on the **body `status` string**, not the HTTP code, to open `UpgradeModal`. Keep both in sync when adding checks.

### Payments (Razorpay, client-side checkout)

`PricingModal` / `UpgradeModal` / `PricingSection` → `CheckoutConfirm` (plan, price, end date, "Pay ₹N") → `payForTier` in `src/lib/checkout.js` → `POST /api/subscription/create-order` (server creates the order with amount derived from `SUBSCRIPTION_TIERS[tier].price * 100` paise, and records `notes.userId` / `notes.tier`) → `window.Razorpay` checkout (script loaded `lazyOnload` in the root layout) → `POST /api/subscription/verify-payment`, which verifies the HMAC, re-fetches the order and payment from Razorpay, and grants the tier from the order's notes. The HMAC alone is *not* sufficient authorisation: it proves the order/payment pair came from Razorpay but says nothing about what was bought or by whom — see the subscription section above.

There is still no Razorpay webhook, so a user who pays and closes the tab before the browser calls `verify-payment` is charged without being upgraded. Adding a `payment.captured` webhook is tracked in `docs/IMPROVEMENT_PLAN.md`.

### Data retention and erasure

Resumes are personal data, so `006_data_retention_and_erasure.sql` added the machinery for getting rid of them:

- `purge_expired_resumes(days)` — retention sweep, **12 months**, defaulted in the function and stated in the privacy policy. Change both together. Scheduled via pg_cron *only if* the extension exists; the migration prints a notice when it does not, in which case it needs an external scheduler.
- `delete_user_analysis_data(clerk_user_id)` — behind `DELETE /api/dashboard/data`. Per-record deletion is `DELETE /api/dashboard/analysis/[id]`. Both sit under `/api/dashboard/*` to inherit the protected matcher.
- Neither touches the Clerk account or the `users` row: erasing analyses leaves the user signed in. Account deletion happens in Clerk and cascades through the FKs.

Do not reintroduce a second copy of the resume text into the logs — `raw_input` was exactly that, nothing read it, and it doubled the PII footprint.

### Shared UI primitives

Four pieces are shared rather than re-implemented per page, and new UI should use them:

- `src/lib/file-validation.js` — resume type/size rules. The type check mirrors the server's deliberately (extension **or** MIME type): browsers report `.pdf` inconsistently, so requiring both would reject uploads the server accepts.
- `src/lib/score.js` — the three score bands (80+ positive, 40-79 caution, under 40 critical), their token colours, and the band labels (`match` wording for job match, `quality` wording for everything else).
- `src/components/results/` — `index.js` holds the report primitives (`ReportLayout` with its sticky section index, `ReportPanel`, `ScoreDisplay`, `ScoreBar`, `KeywordList`, `BulletList`, `CopyButton`, and the shape guards); `AnalyticsResults`, `JobMatchResults` and `SectionImprovementResults` hold each report. The saved-report page (`dashboard/analysis/[id]`) reuses the same components, picked by `analysis_type`. Put new result markup here, not in a page.
- `src/components/ToolLayout.js` — the frame of the three tool pages: header with usage line, input/preview grid, progress, error with retry, full-width report, ads. Pages supply the input, the fetch, and the quota modal. `toFriendlyError` there maps API failures to user copy; the API's `error` strings still contain raw exception text and are not shown.
- `src/components/PlanPanel.js` — plan and usage meters on the dashboard, read from `SubscriptionProvider` rather than fetched again.
- `src/components/ConfirmDialog.js` — confirmation for destructive actions; cancel takes initial focus.
- `src/hooks/useModalA11y.js` — dialog semantics, Escape, focus trap, focus restore, scroll lock. **Every new modal should use it.**

Two non-obvious things `useModalA11y` handles, both found by testing in a browser rather than by reading the code:

- `onClose` is held in a ref, so the effect depends on `isOpen` alone. Callers pass inline arrows; with `onClose` in the deps the effect re-ran every render and re-captured "previously focused" as an element inside the dialog.
- It tracks the last interacted element via `focusin`/`pointerdown`/`click`, because the buttons that open these modals disable themselves while loading — and disabling a focused element moves focus to `<body>`, destroying the restore target before the modal even mounts.

`AnalysisProgress` fakes progress on a timer. The analysis APIs are single request/response with no incremental signal, so the stages are an honest estimate and the bar caps at 95% rather than claiming completion early.

### Client state

`SubscriptionProvider` (in the root layout) checks `/api/subscription/init` on sign-in; a user with no subscription row is treated as needing onboarding and gets the `PricingModal`. The AdSense script is loaded by `AdWrapper` (via `next/script`, deduped by id), not by the root layout, so it only reaches pages that render an ad unit (tool results, blog index) and only for users who see ads. AdSense *auto ads* can still inject on any page once the script has loaded in that tab, so keep auto ads off in the AdSense account. `AdProvider` reads the tier from that same context to decide whether to show ads (free tier only, per `AD_CONFIG.showOnlyToFreeUsers`), so a payment hides ads as soon as `refreshSubscriptionStatus` runs; nothing reloads the page after checkout. All subscription API responses are wrapped as `{ status: 'success', data: … }`.

`src/hooks/useSubscription.js` exports `useFeatureAccess` / `useSubscriptionStatus` for pre-flight checks; note `SubscriptionProvider.js` also exports a differently-shaped `useSubscription` context hook.

### Blog

Articles are markdown files in `public/assets/*.md`, read at build time via `gray-matter` + `marked` in `src/lib/blog.js`; `/blog` and `/blog/[slug]` are server components and the four article pages are statically generated from the files. Titles, dates, descriptions and read-times come from a **hardcoded `articleMap`** in `blog.js`, not from frontmatter, so adding an article means adding both the `.md` file and an `articleMap` entry, or it is silently dropped. The markdown's leading `# Title` line is stripped (the page renders the title); the files use CRLF line endings.

`blog/layout.js` sets a plain `title`, which resets the root `%s | ResumeInsight` template below it, so `blog/[slug]/layout.js` appends the suffix itself.

Long-form text (articles and the legal pages) uses the `.article` class in `globals.css`. Legal pages go through `src/components/LegalPage.js`; their `LAST_UPDATED` constants are the date the wording last changed, and must be bumped by hand when it does.

Server components that need to show a signed-in variant must not use Clerk's server `SignedIn`/`SignedOut`: reading auth turns a static page into a per-request one. Use a client leaf such as `src/components/PrimaryCta.js`.

## Reference docs

`docs/` holds setup guides worth consulting before touching the corresponding integration: `README_SUPABASE_SETUP.md`, `README_AUTH_CLERK_SETUP.md`, `RAZORPAY_PRODUCTION_SETUP.md`, `ADSENSE_SETUP.md`, `SEO_IMPLEMENTATION.md`, `PRODUCTION_CHECKLIST.md`.
