/**
 * Client-side resume file validation.
 *
 * The server is still the authority -- /api/analyze and /api/analyze-overall
 * re-check both type and size against the caller's real tier. This exists so a
 * user finds out *before* uploading several megabytes and waiting, rather than
 * after a 413.
 */

export const MAX_FILE_SIZE_BY_TIER = {
  free: 2 * 1024 * 1024,
  pro: 10 * 1024 * 1024,
  executive: 25 * 1024 * 1024,
};

/**
 * Formats a byte count for display: whole numbers for round tier limits,
 * one decimal for arbitrary file sizes.
 *
 * @param {number} bytes
 * @returns {string|null}
 */
export function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes < 0) return null;

  if (bytes < 1024) return `${bytes}B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)}KB`;

  const mb = bytes / (1024 * 1024);
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)}MB`;
}

/**
 * Checks that a file looks like a PDF.
 *
 * Mirrors the server's rule exactly (extension OR MIME type), because browsers
 * are inconsistent about the MIME type they report for .pdf files -- some send
 * an empty string, some 'application/octet-stream'. Requiring both would reject
 * valid uploads the server would have accepted.
 *
 * @param {File} file
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFileType(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const looksLikePdf =
    file.name?.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

  if (!looksLikePdf) {
    return {
      valid: false,
      error: 'Only PDF files are supported. Please choose a .pdf file.',
    };
  }

  return { valid: true };
}

/**
 * Checks a file against the tier's size limit.
 *
 * `maxFileSize` is optional: when the subscription has not loaded yet we skip
 * the size check rather than guess a limit, and let the server decide.
 *
 * @param {File} file
 * @param {number} [maxFileSize] - Limit in bytes for the user's tier
 * @param {string} [tierName] - Display name, for the message
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFileSize(file, maxFileSize, tierName) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'That file is empty. Please choose another.' };
  }

  if (typeof maxFileSize !== 'number' || maxFileSize <= 0) {
    return { valid: true };
  }

  if (file.size > maxFileSize) {
    const plan = tierName ? `the ${tierName} plan` : 'your current plan';
    return {
      valid: false,
      error: `This file is ${formatBytes(file.size)}, over the ${formatBytes(maxFileSize)} limit on ${plan}.`,
    };
  }

  return { valid: true };
}

/**
 * Runs every check, returning the first failure.
 *
 * @param {File} file
 * @param {Object} [options]
 * @param {number} [options.maxFileSize]
 * @param {string} [options.tierName]
 * @returns {{valid: boolean, error?: string}}
 */
export function validateResumeFile(file, { maxFileSize, tierName } = {}) {
  const type = validateFileType(file);
  if (!type.valid) return type;

  return validateFileSize(file, maxFileSize, tierName);
}
