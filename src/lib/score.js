/**
 * Score bands and the colours derived from them (DESIGN.md 4.1 and 5.6).
 *
 * Three bands, not four: 80+ positive, 40 to 79 caution, under 40 critical.
 * Every place that colours or labels a score reads from here, so what counts
 * as a "good" score cannot drift between the report, the dashboard and the
 * saved-report page.
 */

const LABELS = {
  // The job match score compares a resume against one posting.
  match: { positive: 'Strong match', caution: 'Partial match', critical: 'Weak match' },
  // Every other score rates the resume on its own.
  quality: { positive: 'Strong', caution: 'Needs work', critical: 'At risk' },
};

/**
 * @param {number} score - 0-100
 * @returns {'positive'|'caution'|'critical'}
 */
export function getScoreBand(score) {
  if (score >= 80) return 'positive';
  if (score >= 40) return 'caution';
  return 'critical';
}

// Full class names spelled out so Tailwind's scanner can see them.
const FILL = { positive: 'bg-positive', caution: 'bg-caution', critical: 'bg-critical' };
const TEXT = { positive: 'text-positive', caution: 'text-caution', critical: 'text-critical' };

/** Solid fill for bars. */
export function getScoreColor(score) {
  return FILL[getScoreBand(score)];
}

/** Text colour for numerals and band labels. */
export function getScoreTextColor(score) {
  return TEXT[getScoreBand(score)];
}

/**
 * Plain-language band label, also used for the accessible description so a
 * screen reader announces "72 out of 100, Partial match".
 *
 * @param {number} score - 0-100
 * @param {'match'|'quality'} kind
 */
export function getScoreLabel(score, kind = 'quality') {
  return (LABELS[kind] || LABELS.quality)[getScoreBand(score)];
}

/** Clamps model output to a 0-100 integer; anything non-numeric becomes null. */
export function toScore(value) {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || Number.isNaN(n)) return null;
  return Math.round(Math.max(0, Math.min(100, n)));
}
