# ResumeInsight — Improvement Plan

Findings from a code review on 2026-08-25, ordered by severity. Each item lists the evidence, the impact, and the intended fix.

Status legend: `TODO` · `IN PROGRESS` · `DONE`

---

## P0 — Critical: revenue and access control

### 1. Tier escalation via client-supplied `tier` — `DONE`

**Where:** `src/app/api/subscription/verify-payment/route.js`

`tier` was read from the request body and passed straight to `updateSubscriptionTier`. The Razorpay HMAC only proves that `order_id|payment_id` originated from Razorpay — it carries no information about *what was purchased*. A user could pay ₹249 for Pro and then re-POST the same valid signature triple with `tier: 'executive'` to obtain the ₹999 tier. The entire flow is client-side JS, so no special tooling was required.

Secondary gaps in the same handler:

- No replay protection — the same triple could be POSTed repeatedly.
- No check that the order belonged to the calling user.
- No check that the payment was actually captured.
- No check that the amount paid matched the tier's price.

**Fix:** Treat the client's `tier` as untrusted and ignore it. Server-side:

1. Verify the HMAC signature (retained, now constant-time).
2. `razorpay.orders.fetch(order_id)` and read back the `notes.tier` / `notes.userId` that *the server* wrote at order-creation time.
3. Reject if `notes.userId !== userId`.
4. Reject if the order is not paid, or the amount does not match the tier price.
5. Record `razorpay_payment_id` in a `payment_transactions` table with a UNIQUE constraint; a duplicate insert means replay and is rejected.
6. Only then grant the tier derived from the *order*, never from the request body.

### 2. Subscriptions never expire — `DONE`

**Where:** `src/lib/subscription-service.js`

`current_period_end` was written on upgrade and rendered in the dashboard, but nothing ever read it back to downgrade. There is no cron, no `vercel.json`, and no Razorpay webhook. A single payment granted a paid tier permanently.

`updateSubscriptionTier` also set the period to *calendar month* boundaries, so a user purchasing on the 28th received three days of access.

**Fix:**

- Lazy expiry enforcement in `getOrCreateSubscription`: on every read, if the tier is paid and `current_period_end` is in the past, downgrade to `free` / `status: 'expired'` and persist before returning. No scheduled job required.
- Paid periods now run 30 days from the moment of payment, not to month-end.
- Renewals extend from the existing `current_period_end` when it is still in the future, so paying early does not forfeit remaining days.

### 3. Quota limits bypassable by racing — `DONE`

**Where:** `src/lib/subscription-service.js`

`checkFeatureAccess` read the counter and `recordFeatureUsage` did a separate read-modify-write. Concurrent requests all passed the check before any of them incremented, so a free user could fire N parallel requests and get N analyses.

**Fix:** A single atomic Postgres function, `consume_feature_usage`, performing `INSERT … ON CONFLICT … DO UPDATE … WHERE usage_count < limit RETURNING usage_count`. The reservation happens *before* the expensive Gemini call; if the analysis fails, a matching `refund_feature_usage` decrements the counter (floored at zero), so users are still not charged for failures.

---

## P1 — Broken in production (small fixes, user-visible)

### 4. Paying users still see ads — `DONE`

`src/components/ads/AdProvider.js:47` read `data.subscription?.tier`, but `/api/subscription/status` wraps its payload as `{ status, data: {...} }`. Every user therefore resolved to `'free'`, so ads rendered for Pro and Executive subscribers — degrading exactly the experience they pay to remove.

**Fixed:** the provider now reads `payload.data?.subscription?.tier`. Verified against the real response shape: `free` → ads shown, `pro` and `executive` → ads suppressed.

### 5. Upgrade modal shows the wrong message — `DONE`

The feature pages pass `feature=` and `usageData=` (`src/app/analytics/page.js:501`, `src/app/resume-analysis/page.js:625`, `src/app/section-improvement/page.js:673`) but `UpgradeModal` declares `featureType` and `usageInfo` (`src/components/UpgradeModal.js:45`). Results:

- The "3/3 calls used this month" block never renders (`usageInfo` is always null).
- `reason` is never passed, so it always defaults to `LIMIT_REACHED` — a **file-too-large** rejection tells the user they hit their monthly limit, which is false and actively misleading.

**Fixed:** prop names aligned (`featureType` / `usageInfo`), and `reason` is now carried from the API's `status` field through `upgradeData` to the modal. The size message was additionally hardcoded to "the 2MB limit for the Free tier", which was wrong for Pro (10MB) and Executive (25MB); it now reports the user's actual file size and their real tier limit. Feature keys are mapped to readable labels, so copy reads "Resume Analytics credits" rather than "analytics credits". The three routes now also return `used` alongside `limit`, which the usage block needs.

### 6. Client-side file-size pre-check is a no-op — `DONE`

`src/app/api/subscription/check-access/route.js:47` passed `fileSize` as a third argument to `checkFeatureAccess`, which accepts two (`src/lib/subscription-service.js:181`). The argument was silently discarded, so this pre-flight never caught an oversized file.

**Fixed:** the route now calls `checkFileSize` first when a size is supplied and returns a `FILE_TOO_LARGE` result with the tier's real limit, before falling through to the quota check. The response carries both `allowed` and `canUse` so either consumer shape works.

Note: `useFeatureAccess` in `src/hooks/useSubscription.js` is the only intended caller of this endpoint and is currently not used by any component. Wiring it into `FileUpload` is item 9.

### 7. Dark mode renders unreadable — `DONE`

`src/app/globals.css` retained the Next.js starter's `prefers-color-scheme: dark` block, flipping `body` to `#0a0a0a`/`#ededed` while every component hardcodes `bg-white` and `text-slate-*`. Dark-mode users got near-white text on white cards.

**Fixed by pinning the app to light.** There is not a single `dark:` variant anywhere in `src/`, so honouring the dark preference would mean adding them across the whole component tree — a redesign rather than a fix. The block is removed and `color-scheme: light` is set explicitly, so UA-rendered widgets (form controls, scrollbars) stop arriving dark against white cards.

Real dark mode remains open as a follow-up; it is a design decision, not a bug fix.

Both keyframe animations now also yield to `prefers-reduced-motion`.

*Correction to an earlier note in this document:* `.animate-slideIn` was **not** undefined. `AlertModal` defined it locally in a `<style jsx>` block, so the animation did work. That block also redefined `.animate-fadeIn` with a different duration than `globals.css`. The local block has been removed in favour of the shared definitions, which is a de-duplication rather than a bug fix.

---

## P2 — Privacy and compliance

### 8. Indefinite PII retention with no user-facing deletion — `DONE`

Full resume text is stored in `resumes.content`, plus the first 5,000 characters in `resume_analysis_logs.raw_input`. Resumes are dense PII: names, phone numbers, addresses, employment history.

- No user-facing delete exists. `deleteResume` (`src/lib/resume-service.js:199`) is dead code — no route calls it.
- No retention policy or TTL.
- `src/app/privacy-policy/page.js` does not mention retention periods or erasure rights.

Relevant to India's DPDP Act and to any EU visitors.

**Fixed**, in migration `006_data_retention_and_erasure.sql` plus application code:

- **Stopped storing a second copy of the resume.** `resume_analysis_logs.raw_input` held the first 5,000 characters of every resume, duplicating `resumes.content` — and nothing ever read it back. The column is dropped and the three routes no longer write it. The diagnostic value of the logs (model, duration, success, error) is untouched.
- **Retention.** `purge_expired_resumes(days)` deletes resumes past the window; dependent logs go with them via `ON DELETE CASCADE`, and logs never attached to a resume (written when an analysis fails early) are collected separately. The migration schedules it daily via pg_cron **if the extension is present**, and prints a notice telling you to schedule it yourself if not — so confirm which case applies on your project.
- **Erasure.** `delete_user_analysis_data(clerk_user_id)` resolves the user internally so a caller cannot pass someone else's id. Exposed as `DELETE /api/dashboard/data`, plus `DELETE /api/dashboard/analysis/[id]` for a single record. Both live under `/api/dashboard/*` so they inherit the existing protected matcher, and both still do their own `auth()` check.
- **Dashboard UI.** A delete control on each row and a "Your data" panel with "Delete all my data", both behind a confirming dialog. Deleting does not touch the Clerk account — the user stays signed in with an empty history.
- **Privacy policy** now has a Data Retention section (12 months, stated explicitly) and a Your Rights section describing all three deletion routes.

The retention window is **12 months**, set in the function's default argument and stated in the policy. Change both together if you change it.

> **The migration is destructive.** Dropping `raw_input` permanently discards data already stored in that column. That is the intent, but take a backup first if you want one.

Verified against a throwaway Postgres 16: the column is gone while diagnostic columns survive; retention deletes only rows past the window and cascades correctly; orphan logs are collected; the guard rejects a window of 0 or negative; erasure removes one user's data and leaves the other's intact; erasure for an unknown user is a harmless no-op; and the account row survives.

Already correct: `ON DELETE CASCADE` on both foreign keys, and the Clerk `user.deleted` webhook cleans up the mirrored row.

---

## P3 — UX and quality

### 9. No client-side file validation — `DONE`

`FileUpload` accepted whatever `e.target.files[0]` returned, and a non-PDF drop was swallowed with no feedback at all. A free user could upload 8MB, wait through the transfer, and only then receive a 413.

**Fixed:** new `src/lib/file-validation.js` holds the shared rules. `FileUpload` now validates type and size on both browse and drop, shows an inline `role="alert"` message, and disables submit while invalid. The size limit comes from `SubscriptionProvider`'s `limits.maxFileSize`, so the message names the user's real tier; when the subscription has not loaded the size check is skipped rather than guessed, and the server decides.

The type rule deliberately mirrors the server's (extension **or** MIME type): browsers report `.pdf` inconsistently — sometimes an empty string, sometimes `application/octet-stream` — and requiring both would reject uploads the server accepts.

A file can also now be removed once selected, which previously was impossible without reloading.

### 10. Long AI calls showed only a spinner — `DONE`

**Fixed:** new `AnalysisProgress` component, wired into all three feature pages with per-feature stage lists. Shows a progress bar, a checklist that advances through stages, and an expected duration.

The stages advance on a timer, not from real server progress — the API is a single request that returns only when finished, so there is no incremental signal to report. The component is documented as such, and the bar caps at 95% so it never claims completion before the request resolves.

### 11. Accessibility — `DONE`

**Fixed:** new `useModalA11y` hook applied to `AlertModal`, `UpgradeModal`, and `PricingModal`. Each dialog now has `role="dialog"` (or `alertdialog`), `aria-modal`, and `aria-labelledby`/`aria-describedby` pointing at its real heading and body text. The hook adds Escape-to-close, focus into the dialog on open, focus restoration to the trigger on close, a Tab/Shift+Tab trap, and background scroll lock. During onboarding `PricingModal` is non-dismissible, so Escape is deliberately disabled there while the focus trap still applies.

Elsewhere: the file input has a real `<label htmlFor>`, icon-only buttons have `aria-label`, decorative icons are `aria-hidden`, and score bars expose `role="progressbar"` with the band label so a value is not conveyed by colour alone.

Two bugs were found and fixed **because** this was tested in a browser rather than assumed:

1. `onClose` is passed as an inline arrow, so its identity changed every render. With it in the effect's dependency array the effect tore down and re-ran constantly, re-capturing "previously focused" as an element *inside* the dialog. Held in a ref instead.
2. The buttons that open these modals disable themselves while the request is in flight, and disabling a focused element moves focus to `<body>` — so by the time the modal mounted there was nothing useful to restore to. The hook now also tracks the last interacted element via `focusin`/`pointerdown`/`click`.

### 12. Placeholder hack — `DONE`

The "Example:" block was an absolutely positioned `div` sitting on top of the textarea, overlapping the user's text. Replaced with a real multi-line `placeholder`.

### 13. Large page components — `DONE`

Each feature page held its entire result-rendering tree inline. All three are now extracted into `src/components/results/`:

| Page | Before | After | Extracted to |
|---|---|---|---|
| `analytics/page.js` | 506 | 202 | `AnalyticsResults.js` (298) |
| `resume-analysis/page.js` | 630 | 227 | `JobMatchResults.js` (392) |
| `section-improvement/page.js` | 680 | 329 | `SectionImprovementResults.js` (394) |

The pages are now thin controllers — fetch, error handling, quota modal — and the markup lives with the markup. Shared primitives (`ResultCard`, `BulletList`, `ScoreBar`, `ScoreCircle` in `results/index.js`, and the score bands in `lib/score.js`) back the call sites that matched exactly.

Deliberately **not** done: forcing the remaining per-site markup variations through shared components. They differ in heading level, text size and spacing; unifying them is a design decision about the result layouts, not a refactor, and the primitives are in place whenever that is taken on.

Two bugs in the extraction were caught by rendering the components against mock data in a browser — neither was visible to the build:

1. `parseMarkdownText`, a helper defined in the section-improvement page, was the one closure dependency of that block. Leaving it behind crashed the component at render time. It now lives with the markup that uses it.
2. Two unused imports (`SidebarAd`, and several icons) were left stranded in the pages once their only usage moved out.

---

## P5 — Found while verifying (not yet addressed)

### 14. Result components crash the page when the model omits a key — `TODO`

Nearly every list in the result components maps without a guard, e.g. `path.recommendations.map(...)` inside `gap_analysis.learning_paths`, and `data.summary_insights.top_strengths.map(...)`. If Gemini returns an object that is missing one nested key — which the prompt requests but cannot guarantee — the whole results tree throws and the user sees a blank page rather than a partial result.

This predates the extraction; the code was moved verbatim. It was surfaced by rendering the components against deliberately incomplete data.

Two options, not mutually exclusive:

- An error boundary around the results tree, so a malformed field degrades to a message instead of a white screen. Cheapest, protects all three pages at once.
- Guard the nested maps (`(x ?? []).map(...)`), so a missing field drops one section rather than the page.

---

## P4 — Features worth building

- **PDF export of the analysis** — highest-leverage addition; users want to keep and act on the report offline.
- **Re-analyze / compare against a previous version** — history and scores are already stored, so the diff is nearly free, and it is a real reason to return monthly.
- **Cover letter generator** — already on the README roadmap and reuses the entire existing pipeline.
- **Razorpay webhook (`payment.captured`)** — closes the reliability gap where a user pays and closes the tab before the browser calls `verify-payment`. Also provides a server-authoritative source for item 1.

---

## Operational note

The Supabase project `yaumpztyalauxsyqomeb` stopped resolving in DNS (NXDOMAIN from both 8.8.8.8 and 1.1.1.1), taking every authenticated route down in both local and production environments, since every route calls `getOrCreateUser` before any other work. Cause: free-tier inactivity pause/deletion after ~8 months. Resolution is a dashboard restore; if the project must be recreated, update the three Supabase env vars locally *and* in Vercel, redeploy, and re-run the SQL files in order.
