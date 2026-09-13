import { SUBSCRIPTION_TIERS, PAID_PERIOD_DAYS } from './tiers';

/**
 * Homepage FAQ, in schema.org FAQPage shape so the same object renders the
 * accordion and the JSON-LD. Every answer must stay true to the code
 * (DESIGN.md section 11); limits and file sizes are read from tiers.js.
 */

const MB = 1024 * 1024;
const { free, pro, executive } = SUBSCRIPTION_TIERS;

const question = (name, text) => ({
  '@type': 'Question',
  name,
  acceptedAnswer: { '@type': 'Answer', text },
});

export const faqData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    question(
      'How does the analysis work?',
      "You upload a PDF, and for a job match you paste the job description. We extract the text and send it to Google's Gemini model with instructions to score and review it. The report you see is that review, laid out section by section."
    ),
    question(
      'What happens to my resume?',
      'Your resume text and its report are stored so you can reopen reports from your dashboard. You can delete one report or all of them at any time, and every report is deleted automatically 12 months after it was created.'
    ),
    question(
      'What files can I upload?',
      `PDF only. The Free plan accepts files up to ${free.limits.maxFileSize / MB}MB, Pro up to ${pro.limits.maxFileSize / MB}MB and Executive up to ${executive.limits.maxFileSize / MB}MB. A scanned image has no text to read, so export your resume from your editor as a text PDF.`
    ),
    question(
      'Does a paid plan renew automatically?',
      `No. Pro and Executive are one-time payments for ${PAID_PERIOD_DAYS} days, and you are never charged again unless you buy another plan. Buying the same plan while it is active adds ${PAID_PERIOD_DAYS} days to it. When it ends, your account returns to the Free plan.`
    ),
    question(
      'How accurate is the ATS score?',
      "It is an estimate, not a test against a real applicant tracking system. It reflects common screening practice: standard headings, a readable layout, and keywords from the posting. Treat it as a guide to what to fix, not a guarantee."
    ),
    question(
      'How many analyses can I run?',
      `Free includes ${free.limits.analyze} run of each tool per month. Pro includes ${pro.limits.analyze} of each per month. Executive has no limit. Counts reset on the first of each month, and a run that fails does not count.`
    ),
  ],
};
