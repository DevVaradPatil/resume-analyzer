/**
 * Score thresholds and the colours derived from them.
 *
 * These bands were duplicated verbatim in the analytics and resume-analysis
 * pages. Keeping them here means a change to what counts as a "good" score
 * cannot drift between the two.
 */

export const SCORE_BANDS = [
  { min: 80, label: 'Excellent' },
  { min: 60, label: 'Good' },
  { min: 40, label: 'Needs Work' },
  { min: 0, label: 'Poor' },
];

/**
 * Solid fill colour for bars and dots.
 *
 * @param {number} score - 0-100
 * @returns {string} Tailwind background class
 */
export function getScoreColor(score) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Tinted surface + border, for panels that carry a score.
 *
 * @param {number} score - 0-100
 * @returns {string} Tailwind background and border classes
 */
export function getScoreBgColor(score) {
  if (score >= 80) return 'bg-green-50 border-green-100';
  if (score >= 60) return 'bg-yellow-50 border-yellow-100';
  if (score >= 40) return 'bg-orange-50 border-orange-100';
  return 'bg-red-50 border-red-100';
}

/**
 * Text colour matching the band, for score numerals.
 *
 * @param {number} score - 0-100
 * @returns {string} Tailwind text class
 */
export function getScoreTextColor(score) {
  if (score >= 80) return 'text-green-700';
  if (score >= 60) return 'text-yellow-700';
  if (score >= 40) return 'text-orange-700';
  return 'text-red-700';
}

/**
 * Plain-language label for a score, used as the accessible description so a
 * screen reader announces "72 out of 100, Good" rather than a bare number.
 *
 * @param {number} score - 0-100
 * @returns {string}
 */
export function getScoreLabel(score) {
  return SCORE_BANDS.find((band) => score >= band.min)?.label ?? 'Poor';
}
