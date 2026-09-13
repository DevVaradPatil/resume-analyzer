'use client';

import React from 'react';
import Link from 'next/link';
import { useSubscription } from './SubscriptionProvider';
import { SUBSCRIPTION_TIERS } from '../lib/tiers';

const METERS = [
  { key: 'analyze', label: 'Job match' },
  { key: 'analytics', label: 'Resume analytics' },
  { key: 'improve', label: 'Section rewrites' },
];

const formatDate = (iso, options) => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-IN', options) : null;
};

function UsageMeter({ label, used = 0, limit }) {
  const unlimited = limit === -1;
  const percent = unlimited || !limit ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink-2">{label}</span>
        <span className="font-medium text-ink tabular-nums">
          {unlimited ? 'Unlimited' : `${used} of ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div
          className="mt-2 h-1 overflow-hidden rounded-full bg-sunken"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={used}
          aria-label={`${label}: ${used} of ${limit} used this month`}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  );
}

/**
 * Plan name, validity and this month's usage (DESIGN.md 9.3). Reads the
 * status SubscriptionProvider already fetched instead of fetching again.
 */
export default function PlanPanel() {
  const { subscriptionStatus, isCheckingSubscription } = useSubscription();

  if (isCheckingSubscription && !subscriptionStatus) {
    return <div className="panel h-[188px] animate-pulse bg-sunken" aria-hidden="true" />;
  }
  if (!subscriptionStatus) return null;

  const tier = subscriptionStatus.subscription?.tier || 'free';
  const plan = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
  const validUntil = tier !== 'free' && formatDate(subscriptionStatus.subscription?.currentPeriodEnd, { day: 'numeric', month: 'long', year: 'numeric' });
  const resets = formatDate(subscriptionStatus.resetDate, { day: 'numeric', month: 'long' });

  return (
    <section aria-labelledby="plan-title" className="panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink-3">Your plan</p>
          <h2 id="plan-title" className="mt-0.5 text-xl font-semibold tracking-tight text-ink">
            {plan.name}
          </h2>
          <p className="mt-1 text-sm text-ink-3">
            {validUntil ? `Active until ${validUntil}.` : 'Free, no expiry.'}
            {resets && ` Usage resets on ${resets}.`}
          </p>
        </div>
        {tier !== 'executive' && (
          <Link href="/#pricing" className="btn btn-secondary">
            {tier === 'free' ? 'See plans' : 'Change plan'}
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {METERS.map((meter) => (
          <UsageMeter
            key={meter.key}
            label={meter.label}
            used={subscriptionStatus.usage?.[meter.key]}
            limit={subscriptionStatus.limits?.[meter.key]}
          />
        ))}
      </div>
    </section>
  );
}
