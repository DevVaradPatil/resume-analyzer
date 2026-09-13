'use client';

import React, { useId, useRef, useState } from 'react';
import Image from 'next/image';

const TABS = [
  {
    label: 'Upload',
    line: 'Add your resume PDF and paste the job post.',
    src: '/assets/product/sample-upload.webp',
    alt: 'The job match page with a resume PDF attached and a job description pasted in.',
  },
  {
    label: 'Read the report',
    line: 'A match score, the gap in seniority, and what to fix first.',
    src: '/assets/product/sample-report.webp',
    alt: 'A job match report showing a score of 75 out of 100, a partial match, and top strengths.',
  },
  {
    label: 'Apply the rewrites',
    line: 'Your original lines next to stronger versions you can copy.',
    src: '/assets/product/sample-rewrite.webp',
    alt: 'A section rewrite showing original resume bullets beside the improved version.',
  },
];

/**
 * DESIGN.md 7.3: verb tabs over one large screenshot that crossfades. All
 * three images stay mounted so switching never waits on a download.
 */
export default function SampleReportTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);
  const baseId = useId();

  const onKeyDown = (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (active + keys[e.key] + TABS.length) % TABS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="Sample report"
        onKeyDown={onKeyDown}
        className="grid grid-cols-3 gap-1 rounded-control bg-sunken p-1 lg:col-span-4 lg:flex lg:flex-col lg:gap-2 lg:bg-transparent lg:p-0"
      >
        {TABS.map((tab, i) => {
          const selected = i === active;
          return (
            <button
              key={tab.label}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`rounded-control px-3 py-2 text-center text-sm font-medium transition-colors lg:px-5 lg:py-4 lg:text-left ${
                selected
                  ? 'bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-line)] lg:shadow-[inset_0_0_0_1.5px_var(--color-accent)]'
                  : 'text-ink-3 hover:text-ink lg:hover:bg-sunken'
              }`}
            >
              <span className="block lg:text-base lg:font-semibold">{tab.label}</span>
              <span className={`mt-1 hidden text-[15px] font-normal lg:block ${selected ? 'text-ink-2' : 'text-ink-3'}`}>
                {tab.line}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="relative overflow-hidden rounded-panel border border-line bg-surface shadow-raised lg:col-span-8"
      >
        {TABS.map((tab, i) => (
          <Image
            key={tab.src}
            src={tab.src}
            alt={i === active ? tab.alt : ''}
            aria-hidden={i !== active}
            width={1400}
            height={1000}
            sizes="(min-width: 1024px) 760px, 100vw"
            className={`h-auto w-full transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${
              i === 0 ? '' : 'absolute inset-0'
            } ${i === active ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      <p className="-mt-4 text-sm text-ink-3 lg:hidden">{TABS[active].line}</p>
    </div>
  );
}
