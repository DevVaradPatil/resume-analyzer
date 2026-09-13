/**
 * Plan definitions: the single source for prices and limits.
 *
 * Pure data with no server imports, so client components (pricing and upgrade
 * modals, the homepage pricing section) can read it. subscription-service.js
 * enforces these same values on the server.
 *
 * Feature lines are derived from the limits rather than written by hand. The
 * hand-written copies had drifted: two of them sold Pro as "100 Section
 * Improvements/month" while the server stopped Pro users at 50.
 */

const MB = 1024 * 1024;

/** Days of access one paid purchase buys. Not a recurring subscription. */
export const PAID_PERIOD_DAYS = 30;

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0, // INR
    description: 'Try every tool once a month',
    limits: {
      analyze: 1, // Job match analysis
      analytics: 1, // Overall resume analytics
      improve: 1, // Section improvement
      maxFileSize: 2 * MB,
    },
  },
  pro: {
    name: 'Pro',
    price: 249, // INR, for PAID_PERIOD_DAYS
    description: 'For an active job search',
    limits: {
      analyze: 50,
      analytics: 50,
      improve: 50,
      maxFileSize: 10 * MB,
    },
  },
  executive: {
    name: 'Executive',
    price: 999, // INR, for PAID_PERIOD_DAYS
    description: 'No limits on any tool',
    limits: {
      analyze: -1, // unlimited
      analytics: -1,
      improve: -1,
      maxFileSize: 25 * MB,
    },
  },
};

const FEATURE_NAMES = {
  analyze: ['job match analysis', 'job match analyses'],
  analytics: ['resume analytics report', 'resume analytics reports'],
  improve: ['section rewrite', 'section rewrites'],
};

/**
 * Human-readable plan lines, built from the enforced limits so marketing copy
 * can never promise more (or less) than the server allows.
 *
 * @param {string} tierId - 'free' | 'pro' | 'executive'
 * @returns {string[]}
 */
export function getTierFeatures(tierId) {
  const tier = SUBSCRIPTION_TIERS[tierId];
  if (!tier) return [];

  const usage = Object.entries(FEATURE_NAMES).map(([key, [one, many]]) => {
    const limit = tier.limits[key];
    if (limit === -1) return `Unlimited ${many}`;
    return `${limit} ${limit === 1 ? one : many} a month`;
  });

  return [...usage, `PDFs up to ${tier.limits.maxFileSize / MB}MB`];
}
