import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, CircleCheck, Clock, Lock, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import PricingSection from '../components/PricingSection';
import PrimaryCta from '../components/PrimaryCta';
import SampleReportTabs from '../components/home/SampleReportTabs';
import { ScoreDisplay } from '../components/results';
import { faqData } from '../lib/faq-data';
import sampleAnalytics from '../../docs/sample/outputs/analytics.json';

const CONTAINER = 'mx-auto max-w-[1200px] px-4 sm:px-6';
const H2 = 'text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink md:text-4xl md:leading-[42px]';

// Each promise must be true the day it ships (DESIGN.md 7.2, section 11).
const PROMISES = [
  { icon: Trash2, text: 'Delete reports any time' },
  { icon: Clock, text: 'Auto-deleted after 12 months' },
  { icon: CircleCheck, text: 'Free plan, no card needed' },
  { icon: Lock, text: 'Payments by Razorpay' },
];

// Verbatim before/after from the sample section rewrite
// (docs/sample/outputs/section.json, improved_text line 3). The middle part is
// the placeholder the rewrite leaves for the user's real figure.
const REWRITE_BEFORE = 'Helped move the reconciliation job from cron scripts to a queue based worker';
const REWRITE_AFTER = ['Contributed to the migration of the reconciliation job from legacy cron scripts to a queue-based worker system, resulting in ', '[quantifiable outcome, e.g., X% faster processing or Y fewer manual interventions]', '.'];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* 7.1 Hero */}
      <section className={`${CONTAINER} pt-12 pb-16 lg:pt-16 lg:pb-24`}>
        <div className="grid items-center gap-12 lg:grid-cols-[5fr_7fr]">
          <div className="animate-slideIn">
            <h1 className="text-4xl leading-10 font-semibold tracking-[-0.03em] text-ink lg:text-5xl lg:leading-[52px]">
              See your resume the way recruiters do.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg leading-7 text-ink-2">
              Upload a PDF and a job post. Get a match score, the missing keywords, and rewrites you can paste in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryCta />
              <a href="#sample" className="btn btn-secondary btn-lg">See a sample report</a>
            </div>
          </div>
          <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-raised animate-fadeIn">
            <Image
              src="/assets/product/hero.webp"
              alt="Sample job match report: a match score of 75 out of 100 and the keywords missing from the resume."
              width={1600}
              height={1200}
              priority
              sizes="(min-width: 1024px) 680px, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* 7.2 Data promises */}
      <section aria-label="How we handle your data" className="border-y border-line">
        <ul className={`${CONTAINER} grid grid-cols-2 gap-x-6 gap-y-5 py-8 lg:grid-cols-4`}>
          {PROMISES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-[15px] text-ink-2">
              <Icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* 7.3 Sample report */}
      <section id="sample" aria-labelledby="sample-title" className={`${CONTAINER} scroll-mt-16 py-16 lg:py-24`}>
        <div className="mb-10 max-w-[60ch]">
          <h2 id="sample-title" className={H2}>What a report looks like</h2>
          <p className="mt-3 text-lg leading-7 text-ink-2">
            A real report for an invented resume: a backend engineer applying for a senior payments role.
          </p>
        </div>
        <SampleReportTabs />
      </section>

      {/* 7.4 The three tools */}
      <section aria-labelledby="tools-title" className={`${CONTAINER} py-16 lg:py-24`}>
        <h2 id="tools-title" className={`${H2} mb-10 max-w-[60ch]`}>Three tools, one resume</h2>
        <div className="grid gap-6 lg:grid-cols-12 lg:grid-rows-2">
          <Link
            href="/resume-analysis"
            className="group flex flex-col overflow-hidden rounded-panel border border-line bg-surface transition-colors hover:border-line-strong lg:col-span-7 lg:row-span-2"
          >
            <div className="p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
                Job match
                <ArrowRight size={18} strokeWidth={1.75} className="text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </h3>
              <p className="mt-2 max-w-[48ch] text-[15px] leading-6 text-ink-2">
                Compare your resume with one job post and see exactly which of its keywords you are missing.
              </p>
            </div>
            <div className="mt-auto pl-6 sm:pl-8">
              <Image
                src="/assets/product/bento-keywords.webp"
                alt="Keyword comparison from the sample report: missing keywords highlighted, matched keywords in grey."
                width={1000}
                height={800}
                sizes="(min-width: 1024px) 620px, 100vw"
                className="-mb-24 h-auto w-full rounded-tl-[12px] border-t border-l border-line"
              />
            </div>
          </Link>

          <Link
            href="/analytics"
            className="group rounded-panel bg-accent-soft p-6 transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent-soft)_85%,var(--color-accent))] sm:p-8 lg:col-span-5"
          >
            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
              Resume analytics
              <ArrowRight size={18} strokeWidth={1.75} className="text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </h3>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">
              A score for the resume on its own, with feedback on every section.
            </p>
            <div className="mt-6">
              <ScoreDisplay score={sampleAnalytics.overall_score} kind="quality" caption="Sample overall score" />
            </div>
          </Link>

          <Link
            href="/section-improvement"
            className="group rounded-panel border border-line bg-surface p-6 transition-colors hover:border-line-strong sm:p-8 lg:col-span-5"
          >
            <h3 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
              Improve a section
              <ArrowRight size={18} strokeWidth={1.75} className="text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </h3>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">Paste a section. Get a stronger version.</p>
            <dl className="mt-6 space-y-3 text-[15px] leading-6">
              <div>
                <dt className="text-[13px] font-medium text-ink-3">Before</dt>
                <dd className="text-ink-3">{REWRITE_BEFORE}</dd>
              </div>
              <div>
                <dt className="text-[13px] font-medium text-ink-3">After</dt>
                <dd className="font-medium text-ink">
                  {REWRITE_AFTER[0]}
                  <mark className="rounded-[4px] bg-caution/10 px-1 font-normal text-caution">{REWRITE_AFTER[1]}</mark>
                  {REWRITE_AFTER[2]}
                </dd>
              </div>
            </dl>
          </Link>
        </div>
      </section>

      {/* 7.5 Pricing */}
      <PricingSection />

      {/* 7.6 FAQ */}
      <section aria-labelledby="faq-title" className={`${CONTAINER} py-16 lg:py-24`}>
        <div className="mx-auto max-w-[720px]">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-accent">Questions</p>
          <h2 id="faq-title" className={`${H2} mt-3`}>Before you upload</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {faqData.mainEntity.map((item) => (
              <details key={item.name} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {item.name}
                  <ChevronDown
                    size={20}
                    strokeWidth={1.75}
                    className="shrink-0 text-ink-3 transition-transform duration-[250ms] group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <p className="-mt-1 pb-5 text-[15px] leading-6 text-ink-2">{item.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
        />
      </section>

      {/* 7.7 Closing CTA */}
      <section className={`${CONTAINER} pb-16 lg:pb-24`}>
        <div className="flex flex-col gap-6 rounded-panel bg-accent-soft p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-[24ch] text-2xl leading-8 font-semibold tracking-[-0.02em] text-ink md:text-[28px] md:leading-[34px]">
            Find out what&apos;s holding your resume back.
          </h2>
          <div className="shrink-0">
            <PrimaryCta />
          </div>
        </div>
      </section>
    </>
  );
}
