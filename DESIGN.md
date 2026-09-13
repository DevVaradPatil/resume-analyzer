# DESIGN.md

The visual and interaction source of truth for ResumeInsight. When code and this file disagree, this file wins until it is deliberately changed.

---

## 1. Design read

**Reading this as:** a visual overhaul of a consumer SaaS landing site plus its product screens, for job seekers in India who are anxious about rejection, handing over a document full of personal data, and deciding whether ₹249 is worth it. The language is **trust-first premium**: calm, exact, and credible, leaning toward Tailwind v4 with CSS-variable tokens, Geist, restrained motion, and real product screenshots as the main visual.

Premium here does not mean flashy. It means the site looks like a serious tool built by people who respect your data and your money.

| Dial | Marketing pages | Product screens | Why |
|---|---|---|---|
| `DESIGN_VARIANCE` | 6 | 4 | Asymmetry for character, never at the cost of clarity. People are paying. |
| `MOTION_INTENSITY` | 4 | 3 | Motion explains state changes. It never performs. |
| `VISUAL_DENSITY` | 4 | 5 | Airy enough to feel expensive, dense enough that reports stay scannable. |

**Mode:** redesign, overhaul. New visual language on top of existing content and information architecture. Routes, section order logic, analytics events, and form fields are preserved (see Section 14).

---

## 2. Why the current UI reads as generic

Each item below is a specific, removable cause. Fixing these delivers most of the lift before any new component exists.

| Tell | Where | What replaces it |
|---|---|---|
| Blue to indigo to purple gradients on buttons and the final CTA band | `page.js:636`, 7 uses of `from-purple-600 to-indigo-600` | One accent colour, solid fills (Section 4.1) |
| Poppins with `slate-800` / `slate-600` / `blue-600` | `layout.js`, 162 uses of `slate-800` | Geist on a tuned neutral scale (Section 4.2) |
| "Elevate Your Resume with AI" and "Transform your job application process with precision AI analysis" | `HeroSection.js:74`, `layout.js` metadata | Plain, specific copy (Section 12) |
| Stock-photo avatar row with "Join 5,000+ professionals" | `HeroSection.js:135-153` | Removed. See Section 11 |
| Div-built fake resume scanner with animated highlight bars, floating "92%" and "A+" cards | `HeroSection.js:197-300` | A real screenshot of a real report (Section 13) |
| Four equal stat tiles with unverified numbers | `page.js:112-115`, `696`, `776-790` | Verifiable data-handling promises (Section 7.2) |
| "Step 1 / Step 2 / Step 3" with a gradient connecting line | `page.js:449-546` | Verb-labelled tabs over real screenshots (Section 7.3) |
| Decorative SVG grids and floating blobs | `page.js:180, 364, 421, 595` | Nothing. Negative space does the work |
| Five competing corner radii (`full`, `lg`, `xl`, `2xl`, `3xl`) | across `src/` | Three documented radii (Section 4.4) |
| Icons inside tinted circles on every card | features, stats, how-it-works | Bare icons, or no icon |
| `scale-105` "Most Popular" pricing card | `PricingSection.js:228` | Differentiation by content, not by zoom (Section 8) |
| AdSense units between homepage content and pricing | `page.js:625` | Ads out of every trust moment (Section 11.3) |

---

## 3. Principles

1. **Show the product, do not describe it.** The report is the most persuasive asset this company owns. Real screenshots beat any illustration.
2. **Only say what is true.** Every number, promise, and badge on the page must be defensible today. A premium site with one fake statistic is a cheap site.
3. **One accent, used for action.** Colour means "you can do something here" or "this is your score". It is never decoration.
4. **Borders before shadows, space before borders.** Hierarchy comes from spacing and type weight first.
5. **Calm at the paywall.** The upgrade and checkout moments get the most care and the least noise.

---

## 4. Tokens

All colour, radius, and shadow values live as CSS variables in `src/app/globals.css` inside Tailwind v4's `@theme`. Components use the generated utilities (`bg-canvas`, `text-ink-2`, `rounded-panel`). **No raw hex values and no `slate-*` / `blue-*` palette utilities in components.**

### 4.1 Colour

The accent is derived from the existing logo mark (`#1FB3E5` in `public/logo.svg`), deepened and desaturated until white text on it passes WCAG AA. This keeps the brand recognisable while leaving the generic `blue-600` behind.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `canvas` | `#F7F8FA` | Page background | |
| `surface` | `#FDFDFE` | Panels, inputs, modals | |
| `sunken` | `#EFF1F4` | Wells, code blocks, skeletons | |
| `line` | `#E4E7EC` | Borders, dividers | |
| `line-strong` | `#CDD2DA` | Input borders, hover borders | |
| `ink` | `#0E1116` | Headlines, primary text | 18.5:1 on canvas |
| `ink-2` | `#3A4150` | Body text | 10.1:1 on canvas |
| `ink-3` | `#5B6371` | Secondary text, helper text, placeholders | 5.7:1 on canvas |
| `accent` | `#1B6B8F` | Primary buttons, links, focus rings, active states | 5.9:1 white on accent |
| `accent-hover` | `#155673` | Hover and pressed accent | 8.2:1 |
| `accent-soft` | `#E8F2F7` | Selected rows, active tab background, CTA band | |
| `positive` | `#1A7A50` | Score 80+, success states | 5.3:1 on white |
| `caution` | `#94600F` | Score 40 to 79, warnings | 5.3:1 on white |
| `critical` | `#C2413A` | Score under 40, errors, destructive buttons | 5.1:1 on white |

Rules:

- **Semantic colours are data, not decoration.** `positive`, `caution`, and `critical` appear only on scores, validation, and destructive actions. Never on marketing icons or section backgrounds.
- **No gradients** on buttons, text, or section backgrounds. One exception: none.
- **Score bands** keep their existing thresholds in `src/lib/score.js` (80 / 60 / 40) but map to three colours, not four: 80+ `positive`, 40 to 79 `caution`, under 40 `critical`. Orange and yellow both read as "mediocre" and splitting them adds noise.

### 4.2 Typography

**Geist** for everything, **Geist Mono** only for literal data a user might copy (keywords, file names). Both ship through `next/font/google`, which the project already uses for Poppins, so this is a swap with no new dependency.

| Role | Size / line-height | Weight | Tracking | Notes |
|---|---|---|---|---|
| Display (hero H1) | 56/60 desktop, 36/40 mobile | 600 | -0.03em | Max 2 lines |
| H2 (section) | 36/42 desktop, 28/34 mobile | 600 | -0.02em | |
| H3 | 20/28 | 600 | -0.01em | |
| Body large | 18/28 | 400 | 0 | `ink-2`, max 60ch |
| Body | 16/26 | 400 | 0 | `ink-2`, max 65ch |
| Small | 14/20 | 400 or 500 | 0 | Helper text, table cells |
| Label | 13/18 | 500 | 0 | Form labels, badges |
| Score numeral | 64/64 | 600 | -0.03em | `tabular-nums` |
| Price numeral | 44/48 | 600 | -0.02em | `tabular-nums` |

Rules:

- Emphasis inside a headline uses **weight or `ink` colour of the same family**. Never a second typeface, never gradient text.
- All numbers that change or compare (scores, prices, usage counts) use `tabular-nums` so they do not jitter.
- Uppercase letter-spaced labels are rationed (see the eyebrow budget in Section 7).

### 4.3 Spacing and layout

- 4px base unit. Use the Tailwind scale; no arbitrary pixel values in components.
- Container: `max-w-[1200px] mx-auto px-6` (`px-4` under 640px).
- Section padding: `py-24` desktop, `py-16` mobile.
- Hero top padding: `pt-16` below the nav. Hard cap `pt-24`.
- Grids use CSS Grid, never flexbox percentage maths. Every multi-column layout declares its under-768px single-column fallback in the same component.
- Full-height sections use `min-h-[100dvh]`, never `h-screen`.

### 4.4 Radius

Three values. Nothing else ships.

| Token | Value | Applies to |
|---|---|---|
| `rounded-control` | 10px | Buttons, inputs, selects, tabs, dropdown items |
| `rounded-panel` | 16px | Panels, modals, bento tiles, pricing plans, screenshots |
| `rounded-full` | 9999px | Badges, avatars, toggles, the tier switcher |

Images nested inside a panel use 12px so the curves stay concentric.

### 4.5 Elevation

- **Default is flat:** `surface` fill plus a 1px `line` border. Most panels need nothing more.
- **Raised** (dropdowns, sticky nav once scrolled): `0 1px 2px rgb(14 17 22 / 0.06), 0 8px 24px rgb(14 17 22 / 0.08)`.
- **Overlay** (modals): `0 24px 64px rgb(14 17 22 / 0.18)` over a `rgb(14 17 22 / 0.4)` scrim. No `backdrop-blur` on the scrim.
- No pure-black shadows, no coloured glows.
- **Focus ring:** `outline: 2px solid accent; outline-offset: 2px`, applied with `:focus-visible` on every interactive element.

### 4.6 Motion

`framer-motion` is already installed; keep it. Every animation must name its reason (state change, feedback, or reveal order).

| Token | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals |
| `duration-fast` | 150ms | Hover, press, focus |
| `duration-base` | 250ms | Tabs, toggles, dropdowns |
| `duration-slow` | 450ms | Hero entrance, section reveal |

Allowed:

- Hero entrance: headline, sub, CTAs, screenshot rise 12px and fade in once, 60ms stagger.
- Section reveal: fade and 16px rise on first entry only (`whileInView`, `once: true`).
- Report tabs: crossfade screenshots on tab change.
- Button press: `scale(0.98)` on `:active`.
- Score reveal on the results screen: numeral counts up once over 600ms.

Banned: infinite loops (except the progress indicator), parallax, marquees, floating decorative shapes, scroll hijacking, hover tilt, cursor effects, `window.addEventListener('scroll')`.

Everything above collapses to instant under `prefers-reduced-motion: reduce`.

### 4.7 Icons

`lucide-react` stays: every component already uses it and swapping families buys nothing a user can see. Standardise instead:

- `strokeWidth={1.75}` everywhere, sizes 16, 18, or 20 only.
- Icons inherit text colour. **No icon sits inside a tinted circle or square** as decoration.
- Decorative icons get `aria-hidden="true"`. Icon-only buttons get `aria-label`.
- No emoji in UI copy.

### 4.8 Layers

`nav 40` · `dropdown 50` · `modal 100` · `confirm dialog 110` · `toast 120`. No other `z-*` values.

### 4.9 Theme

**Light only at launch.** `CLAUDE.md` records this as a deliberate decision, and it stands. The redesign still routes every colour through the tokens above, which is what makes dark mode a contained follow-up later (redefine the variables under `[data-theme="dark"]`) instead of the rewrite it would be today.

### 4.10 The `@theme` block

Drop-in starting point for `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-canvas: #F7F8FA;
  --color-surface: #FDFDFE;
  --color-sunken: #EFF1F4;
  --color-line: #E4E7EC;
  --color-line-strong: #CDD2DA;
  --color-ink: #0E1116;
  --color-ink-2: #3A4150;
  --color-ink-3: #5B6371;
  --color-accent: #1B6B8F;
  --color-accent-hover: #155673;
  --color-accent-soft: #E8F2F7;
  --color-positive: #1A7A50;
  --color-caution: #94600F;
  --color-critical: #C2413A;

  --font-sans: var(--font-geist), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  --radius-control: 10px;
  --radius-panel: 16px;

  --shadow-raised: 0 1px 2px rgb(14 17 22 / 0.06), 0 8px 24px rgb(14 17 22 / 0.08);
  --shadow-overlay: 0 24px 64px rgb(14 17 22 / 0.18);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}

:root { color-scheme: light; }

body {
  background: var(--color-canvas);
  color: var(--color-ink-2);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

---

## 5. Components

Specs, not files. Buttons, fields, panels, badges and the modal scrim are Tailwind `@utility` classes in `globals.css` (`btn btn-primary`, `field`, `panel`, `badge`, `scrim`), so they work on any element, `<Link>` included, without a wrapper component.

Plan names, prices, limits and the feature lines shown to users all come from `src/lib/tiers.js`. Feature lines are derived from the enforced limits; never hand-write them in a component.

### 5.1 Button

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| Primary | `accent`, hover `accent-hover` | white | none | One per view: the main action |
| Secondary | `surface`, hover `sunken` | `ink` | `line-strong` | Alternatives |
| Ghost | transparent, hover `sunken` | `ink-2` | none | Tertiary, toolbar |
| Destructive | `critical` | white | none | Confirm dialogs only |

- Height 40px (default) or 48px (hero, pricing). Padding `px-4` / `px-6`. `rounded-control`. Label 15px weight 500.
- **Labels are one to three words and never wrap** at desktop.
- Loading keeps the button width fixed and swaps the label for a small spinner plus a verb ("Analyzing").
- Disabled: 50% opacity, `cursor-not-allowed`, no hover change.
- **One label per intent across the whole site:**
  - Sign up: **"Start free"** (nav, hero, pricing Free plan, final CTA)
  - Sign in: **"Sign in"**
  - Paid plans: **"Get Pro"**, **"Get Executive"**
  - Run the tool: **"Analyze resume"**, **"Improve section"**

### 5.2 Form field

Label above (13/18, 500, `ink`), control, helper or error below (14/20). `gap-2` inside the block.

- Input: 44px tall, `surface` fill, 1px `line-strong` border, `rounded-control`, `ink` text, `ink-3` placeholder. Focus: `accent` border plus focus ring.
- Error: `critical` border, message below with an icon, `aria-invalid`, and `aria-describedby` pointing at the message. `FileUpload` already implements this behaviour; restyle it to these tokens.
- Placeholders are examples, never labels.

### 5.3 Upload drop zone

`FileUpload` keeps its logic (Section 14). Visual spec:

- `surface` panel, 1.5px dashed `line-strong` border, `rounded-panel`, 160px min height.
- Idle: one line "Drop your resume PDF", one helper line "or browse. PDF up to 2MB on Free." (the limit comes from the user's tier).
- Drag over: border becomes solid `accent`, fill `accent-soft`.
- File accepted: collapses to a single 64px row with file icon, name, size, and a remove button. The empty drop zone does not stay on screen once a file is chosen.
- Rejected: row turns `critical`, message below.

### 5.4 Panel

`surface`, 1px `line`, `rounded-panel`, `p-6` (`p-5` mobile). Nesting a panel inside a panel is not allowed; group inside a panel with spacing and `divide-y divide-line`.

### 5.5 Badge

`rounded-full`, 22px tall, `px-2.5`, 12/16 weight 500. Neutral (`sunken` fill, `ink-2` text) by default; semantic variants use the semantic colour as text on a 10% tint. **No coloured dot inside badges.**

### 5.6 Score display

The product's signature element. It appears on results, the dashboard, and the homepage screenshots, so it must be excellent.

- Large numeral (64px, `tabular-nums`) followed by "/100" in `ink-3` at 20px.
- Band label beneath in the semantic colour: "Strong match" (80+), "Partial match" (40 to 79), "Weak match" (under 40). Use "Strong / Needs work / At risk" wording for the non-match analytics score.
- A thin 4px bar (track `sunken`, fill semantic) sits under the label for scanability in product screens only.
- Screen readers get "72 out of 100, partial match". `ScoreBar` and `ScoreCircle` in `src/components/results/index.js` already carry this semantics; restyle them, do not rebuild them.

### 5.7 Modal and confirm dialog

Behaviour is solved by `useModalA11y`; this is appearance only.

- `surface`, `rounded-panel`, `shadow-overlay`, max width 480px (confirm) or 640px (upgrade). Scrim `rgb(14 17 22 / 0.4)`.
- Title H3, body `ink-2`, actions right-aligned (stacked full width on mobile) with the safe action first in DOM order.
- Enter: 8px rise and fade, `duration-base`.

### 5.8 Analysis in progress

Replace the centred spinner in `AnalysisProgress` with a **skeleton of the report it is about to show**: a score block, three metric rows, and two list blocks in `sunken`, with a gentle 1.2s opacity pulse. The stage checklist sits beside it on desktop and above it on mobile. Keep the honest behaviour: stages advance on a timer and the bar never passes 95% before the request resolves.

### 5.9 Empty, error, and limit states

- **Empty** (dashboard with no analyses): one sentence, one primary button, no illustration. "No reports yet. Your first analysis appears here." with "Analyze resume".
- **Error**: inline panel with `critical` left border (3px), plain message, and one recovery action ("Try again"). Never raw exception text.
- **Monthly limit**: not an alarm. Neutral panel, no warning triangle. "You've used your free analysis for September. It resets on 1 October." followed by plan options. Calm copy converts better than a red alert.

---

## 6. Navigation and footer

**Nav** (64px, one line at every width 1024px and up, `canvas` fill, always-visible `line` bottom border; a scroll-triggered border was dropped because it needs a scroll observer for no real gain):

`Logo + ResumeInsight` · `Job match` · `Analytics` · `Improve` · `Pricing` · `Blog` ... `Sign in` (ghost) · `Start free` (primary)

Signed in, the right side becomes `Dashboard` plus the Clerk user button. Under 1024px: logo, "Start free", and a menu button opening a full-width sheet.

**Footer**: two rows on `canvas` with a top `line`. Row one: logo and a one-sentence description on the left, three short link columns (Product, Resources, Legal) on the right. Row two: copyright with the builder credit, and "Payments processed by Razorpay" as plain text. The Razorpay mark is saved for the checkout step (8.3), where it earns its extra network request. Nothing else: no newsletter box, no social icon row unless the accounts are active.

---

## 7. Homepage composition

Seven sections after the nav, seven different layout families, no two adjacent sections sharing a structure.

**Eyebrow budget: 2 in total.** Recommended placement: Pricing and FAQ. The hero gets none.

### 7.1 Hero: asymmetric split

- Grid `lg:grid-cols-[5fr_7fr]`, text left, screenshot right. Single column under 1024px with the screenshot below the CTAs.
- **Headline** (max 2 lines): "See your resume the way recruiters do."
- **Sub** (20 words): "Upload a PDF and a job post. Get a match score, the missing keywords, and rewrites you can paste in."
- **CTAs:** "Start free" (primary, 48px) and "See a sample report" (secondary, scrolls to 7.3).
- **Visual:** a real screenshot of the job-match report, cropped to the score block and missing-keywords list, in a `rounded-panel` frame with a `line` border and `shadow-raised`. Not a browser mockup, not a laptop render.
- **Nothing else in the hero.** No avatar row, no "Join N professionals", no rating, no stats, no badge above the headline.

### 7.2 Data promises: inline row

Directly under the hero, replacing the fabricated stats block. Four items in a horizontal row (2x2 on mobile), each an icon plus one short line, no panels:

- "Delete your reports any time"
- "Reports auto-delete after 12 months"
- "PDF text is used only to produce your report"
- "Payments by Razorpay"

Each line must be true at the moment it ships. The first two are backed by migration 006 and the dashboard delete controls. Confirm the third against the Gemini API terms for the key in use before publishing it.

### 7.3 Sample report: tabs over one large screenshot

Replaces "How it works" and its Step 1 / 2 / 3.

- Left column (4/12): three tab buttons stacked vertically, each a verb plus one line. "Upload" / "Read the report" / "Apply the rewrites".
- Right column (8/12): one large screenshot that crossfades when the tab changes.
- Under 1024px: tabs become a horizontal segmented control above the image.
- Screenshots use a **fictional sample resume** (Section 13), never a real user's data.

### 7.4 The three tools: bento, 3 items, 3 cells

Replaces the grid of equal feature cards.

- Desktop grid: Job match takes a tall cell spanning two rows on the left (7/12); Analytics and Improve stack on the right (5/12).
- **Job match cell:** H3, one sentence, a cropped screenshot of the keyword comparison bleeding off the bottom edge.
- **Analytics cell:** `accent-soft` fill, H3, one sentence, the score block rendered at small scale.
- **Improve cell:** `surface`, H3, and a real before/after of one resume bullet, the "after" line in `ink` weight 500.
- Each cell links to its tool. Single column on mobile, Job match first.

### 7.5 Pricing

See Section 8.

### 7.6 FAQ: accordion

Eyebrow "Questions". The 8 entries in `src/lib/faq-data.js`, single column, max 720px, `divide-y divide-line`, chevron rotates on open. Review each answer against Section 11 before launch.

### 7.7 Closing CTA: band

`accent-soft` band inside the container (`rounded-panel`, not full bleed), left-aligned H2 "Find out what's holding your resume back." and one "Start free" button right-aligned. Same light theme as the rest of the page; the old full-bleed purple gradient section is removed.

---

## 8. Pricing and checkout

This is where trust converts to revenue. It gets the most restraint on the site.

### 8.1 Layout

- Three plans in a `lg:grid-cols-3` grid, equal width, equal height, **no scaling, no lift, no glow**.
- Pro is recommended through content alone: an `accent` 1.5px border, a neutral "Recommended" badge in the top-right, and its button is the only primary button in the row. Free and Executive get secondary buttons.
- Each plan, top to bottom: name (H3), one-line who-it's-for, price numeral, price qualifier, button, divider, 4 to 5 feature lines with check icons in `ink-3`.
- Mobile: stacked, Pro first.

### 8.2 Price presentation

- "₹249" numeral, qualifier "for 30 days" underneath. Not "/month": the product sells a 30-day pass, not a recurring subscription (`PAID_PERIOD_DAYS` in `subscription-service.js`, no renewal webhook).
- Directly under the plan grid, one centred line in `ink-3`: "One-time payment. No auto-renewal. Pay again only if you need more time." **See Section 11.2 before shipping this line.**
- Show accepted methods (UPI, cards, netbanking) as small text beside the Razorpay mark. Only list methods actually enabled in the Razorpay dashboard.

### 8.3 The moment before Razorpay opens

`PricingModal` and `UpgradeModal` currently jump straight to Razorpay. Add a confirmation step inside the same modal:

- Plan name, what it unlocks in two lines, price, "Valid until 13 October 2026" computed from today, and the no-auto-renewal line.
- One primary button: "Pay ₹249".
- Below it: "Secured by Razorpay" with the mark.

After a successful payment, replace the generic success alert with a panel that restates the plan, the new expiry date, and a "Continue to your report" button. Do not reload the page.

---

## 9. Product screens

The feature pages, results, and dashboard. Same tokens, higher density, less motion.

### 9.1 Feature pages (`/resume-analysis`, `/analytics`, `/section-improvement`)

- Page header: H1 at H2 size (36px), one sentence, and a usage line on the right in `ink-3`: "1 of 1 free analyses left this month". It reads from `SubscriptionProvider`, which already has the data.
- Input panel on the left (5/12), a preview of what the report will contain on the right (7/12) until a report exists. Then the report takes full width and the input collapses to a compact "New analysis" button.
- Remove the page-level gradient backgrounds (`from-slate-50 to-blue-50` and `to-emerald-50`). Every page sits on `canvas`.

### 9.2 Results reports

`AnalyticsResults`, `JobMatchResults`, and `SectionImprovementResults` are restyled, not restructured.

- Report header: score display (5.6) left, a 2 to 3 sentence summary right, then a sticky in-page section index on desktop (Summary, Keywords, Sections, Rewrites).
- Keyword lists: `rounded-full` badges in Geist Mono 13px. Matched keywords neutral, missing keywords with a `critical` 10% tint.
- Rewrites: original in `ink-3`, improved in `ink`, a copy button that confirms with a check icon for 2 seconds.
- Metric groups use `divide-y` inside one panel instead of a card per metric.
- Add "Download PDF" to the report header as a disabled placeholder only if the feature is scheduled; otherwise leave it out.

### 9.3 Dashboard

- Top: plan panel (plan name, expiry date, three usage meters) beside a "New analysis" primary button.
- Recent reports as a table-like list: file name, report type, score (numeral plus band colour), date, and an overflow menu holding "Open" and "Delete". The trash icon currently sitting in every row moves into that menu.
- "Your data" panel stays at the bottom, unchanged in behaviour.

---

## 10. Blog and legal pages

- Article body: 18/30, `ink-2`, max 68ch, H2 28/34, generous `my-8` around images. Links `accent` with underline offset 3px.
- Blog index: first article as a wide featured row, the rest in a two-column list with title, one-line description, date, and read time. No thumbnails unless each article has a real image.
- Legal pages: same article styles, a table of contents on desktop, and a "Last updated" date at the top.

---

## 11. Trust and truth rules

Hard rules. A violation blocks launch the same way a broken build does.

### 11.1 No unverifiable claims

Remove before the redesign ships, and do not reintroduce without a real data source:

- "10,000+ Resumes Analyzed", "92% Success Rate", "+35% Average Score Improvement", "5,000+ Happy Users" (`page.js:112-115`)
- "4.9/5 Average Rating" (`page.js:696`) and the repeated stats at `page.js:776-790`
- "Join 5,000+ professionals who improved their careers" and the Unsplash avatar row (`HeroSection.js`)
- "Trusted by Job Seekers / Our AI has helped thousands of professionals land their dream jobs"
- "100% free" beside a paid pricing table (`page.js:756`)

The database currently holds 17 users. Shipping numbers in the thousands on a page that asks for payment is misleading advertising, and it is exactly the kind of detail a careful buyer checks.

Allowed later: a live count read from the database once it is a number worth showing, real testimonials with the person's written consent and full name, and a "Used at" logo wall only for companies that have agreed to it.

### 11.2 Terms of Service contradict the product

`src/app/terms-of-service/page.js:66` says a subscription "will automatically renew under the exact same conditions unless you cancel it". The code sells a **non-renewing 30-day pass**. The pricing copy in Section 8.2 is true to the code and false to the Terms.

This is a legal document, so the design does not change it. **The owner must update the Terms (ideally with legal review) before the "No auto-renewal" line is published.** Until then, omit that line.

*Resolved 13 September 2026: section 5 of the Terms now describes one-time 30-day plans with no auto-renewal, and the line ships on pricing, checkout and the FAQ. A lawyer has not reviewed the new wording.*

### 11.3 Ads

AdSense currently renders on the homepage, all three tool pages, and the blog. Ads beside a paywall tell the visitor this is an ad-funded site, which undercuts both "premium" and "worth paying for".

Recommended placement, which is a revenue decision for the owner:

| Surface | Ads |
|---|---|
| Homepage, pricing, checkout, dashboard, upgrade modal | Never |
| Tool pages and results | Never above the report. At most one unit after the report, free tier only |
| Blog | Allowed, one in-article unit and one after the article |

Paid tiers never see ads anywhere (already the rule in `AD_CONFIG`).

### 11.4 Sensitive data on screen

- Screenshots, sample reports, and marketing assets use an invented sample resume. Never a real user's report, including the owner's own.
- Upload areas state what happens to the file in one line: "Your PDF is read to build this report."

---

## 12. Voice and copy

- Plain, specific, second person. Say what the user gets: a match score, missing keywords, rewrites.
- "AI" appears at most once per page. The value is the report, not the model.
- Banned: elevate, transform, unleash, supercharge, revolutionize, seamless, cutting-edge, next-gen, game-changer, precision AI, dream job, unlock your potential.
- No em-dashes or en-dashes anywhere in the UI. Use a period, comma, colon, or parentheses. Ranges use a hyphen.
- Headlines 8 words or fewer. Section sub-copy 25 words or fewer.
- Errors say what happened and what to do: "We couldn't read text from this PDF. If it's a scanned image, export it again from your editor as a text PDF."
- Update `metadata` in `layout.js` in the same voice. Keep the title structure (`%s | ResumeInsight`) so search listings stay stable.

---

## 13. Imagery

No stock photography anywhere. The imagery is the product.

**Sample resume:** create one fictional resume (invented name, invented contact details, a plausible mid-level profile) plus one fictional job post. Run all three tools on them and screenshot the redesigned reports. Store under `public/assets/product/`.

Required slots:

| Slot | Size | Content |
|---|---|---|
| Hero | 1600 x 1200 | Job match report: score block and missing keywords |
| Sample report tab 1 | 1400 x 1000 | Upload panel with the sample file attached |
| Sample report tab 2 | 1400 x 1000 | Full job match report, top half |
| Sample report tab 3 | 1400 x 1000 | Section improvement, before and after |
| Bento, Job match | 1000 x 800 | Keyword comparison crop |
| Open Graph | 1200 x 630 | Replaces `public/assets/landing.png`: headline plus hero screenshot on `canvas` |

- Export as WebP, render with `next/image`, hero marked `priority`, explicit width and height on every image.
- Screenshots are captured at 2x and displayed in a `rounded-panel` frame with a `line` border. No device frames.
- Once the Unsplash avatars are gone, remove `images.unsplash.com` and `plus.unsplash.com` from `remotePatterns` in `next.config.js`.

---

## 14. Redesign guardrails

Never change without the owner's explicit approval:

- **Routes:** `/`, `/resume-analysis`, `/analytics`, `/section-improvement`, `/dashboard`, `/dashboard/analysis/[id]`, `/blog`, `/blog/[slug]`, `/privacy-policy`, `/terms-of-service`, `/sign-in`, `/sign-up`.
- **Analytics events** in `src/lib/analytics.js`: `trackResumeUpload`, `trackAnalysisStart`, `trackAnalysisComplete`, `trackAnalysisError`, `trackSectionImprovement`, `trackPageView`, `trackFeatureUsage`. Restyled components must keep firing them at the same moments.
- **Form contracts:** the `resume` and `job_description` FormData fields, `section_type` and `original_text` JSON fields, and the section type values.
- **Behaviour already verified:** `useModalA11y`, `FileUpload` validation, `ConfirmDialog` focus order, quota and upgrade flows, payment verification. The redesign changes how these look, never how they work.
- **SEO:** page titles, meta descriptions, JSON-LD in `structured-data.js`, `sitemap.js`, `robots.ts`, and blog slugs.
- **Logo:** `public/logo.svg` stays as it is. The accent was chosen to sit beside it.
- **Legal copy:** privacy policy and terms change only through the owner (Section 11.2).

---

## 15. Accessibility and performance

- WCAG AA contrast on every text and control pair. The token table (4.1) is pre-checked; new pairings must be checked before use.
- Every interactive element is keyboard reachable with a visible `:focus-visible` ring.
- Touch targets at least 44px on mobile.
- `prefers-reduced-motion` disables every animation in 4.6.
- LCP under 2.5s (hero screenshot is the LCP element: `priority`, WebP, correct dimensions), CLS under 0.1, INP under 200ms.
- No layout shift when fonts load: `next/font` with `display: swap` and matching fallback metrics.
- The AdSense script loads only on pages that are allowed to show ads (Section 11.3), not globally from `layout.js`.

---

## 16. Implementation order

Each phase ships on its own and leaves the site coherent.

1. **Foundation.** `@theme` tokens, Geist via `next/font/google`, body styles. Remove Poppins. Low risk, largest single visual lift.
2. **Shared pieces.** Buttons, form fields, `FileUpload`, `Navbar`, `Footer`, all modals, `ConfirmDialog`, `AnalysisProgress` skeleton, badges.
3. **Product screens.** The three results components, the three feature pages, the dashboard. This comes before the homepage so the screenshots in phase 5 show the new design.
4. **Truth pass.** Remove every claim listed in 11.1, move ads per 11.3, and get the Terms of Service fixed (owner). *Code part done: claims, avatar row and homepage ads removed; tool pages keep one unit after the report; blog index lost its top banner; pricing says "for 30 days" instead of "/month" and no longer says "Cancel anytime". Still open: Terms of Service line 66 (owner). The hero illustration's scores are labelled "Sample" until phase 5 replaces it.*
5. **Homepage.** Create the sample resume and capture screenshots, then build 7.1 to 7.7 and the new pricing and checkout flow. *Done. Deviations: hero headline is 48px at desktop (56px wrapped to three lines at 1366px); the third data promise is "Free plan, no card needed" because the Gemini data-use claim is unconfirmed; the FAQ has 5 entries (the old 8 did not exist, and several old answers were false) and has no auto-renewal entry until 11.2 is resolved; accepted payment methods and the Razorpay mark are omitted because the enabled methods are unknown. Sample inputs and the real model outputs behind every screenshot live in `docs/sample/`.*
6. **Blog and legal.** Typography pass, featured article row, table of contents. *Done: `.article` typography, featured row plus two-column list, contents list on legal pages, real last-updated dates, sign-in and sign-up themed. Legal wording unchanged. Article bodies are the owner's markdown and still contain em-dashes and emoji (Section 12 applies to UI copy; editing articles is the owner's call).*

---

## 17. Pre-flight checklist

Run before merging any phase.

- [ ] No `slate-*`, `gray-*`, `blue-*`, `indigo-*`, or `purple-*` utilities and no raw hex in changed components
- [ ] No gradients (`bg-gradient-*`) anywhere
- [ ] Only `rounded-control`, `rounded-panel`, `rounded-full` (plus 12px for images in panels)
- [ ] Zero em-dashes and en-dashes in visible copy
- [ ] No banned words from Section 12
- [ ] No number, rating, testimonial, or logo that cannot be sourced (Section 11.1)
- [ ] One primary button per view; one label per intent (5.1)
- [ ] No CTA label wraps at desktop
- [ ] Hero: headline 2 lines max, sub 20 words max, CTAs visible without scrolling on a 1366x768 screen
- [ ] Eyebrows on the homepage: 2 or fewer
- [ ] No icons inside tinted circles; no decorative dots
- [ ] No div-built fake product UI; every product image is a real screenshot of the sample resume
- [ ] No ads on homepage, pricing, dashboard, or upgrade flows
- [ ] Every multi-column layout declares its mobile fallback
- [ ] Keyboard pass: tab through the page, every control reachable with a visible focus ring
- [ ] `prefers-reduced-motion` checked with the OS setting enabled
- [ ] Analytics events still fire (Section 14)
- [ ] Lighthouse on the homepage: LCP under 2.5s, CLS under 0.1
