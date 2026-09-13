'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import CheckoutConfirm from './CheckoutConfirm';
import { useSubscription } from './SubscriptionProvider';
import { useModalA11y } from '../hooks/useModalA11y';
import { SUBSCRIPTION_TIERS, PAID_PERIOD_DAYS, getTierFeatures } from '../lib/tiers';

const TIER_IDS = ['free', 'pro', 'executive'];
const RECOMMENDED_TIER = 'pro';

const formatDate = (iso) => {
  const date = iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
};

function CheckoutModal({ tierId, onClose }) {
  const titleId = useId();
  const dialogRef = useModalA11y(Boolean(tierId), onClose);
  if (!tierId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 scrim animate-fadeIn" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-overlay outline-none animate-slideIn"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost absolute top-3 right-3 h-8 w-8 px-0">
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <CheckoutConfirm tierId={tierId} titleId={titleId} onDone={onClose} />
      </div>
    </div>
  );
}

/**
 * Homepage pricing (DESIGN.md 8.1, 8.2). Every name, price and feature line
 * comes from src/lib/tiers.js.
 */
export default function PricingSection() {
  const { isSignedIn } = useUser();
  const { subscriptionStatus } = useSubscription();
  const [checkoutTier, setCheckoutTier] = useState(null);

  const currentTier = isSignedIn ? subscriptionStatus?.subscription?.tier : null;
  const currentEnd = formatDate(subscriptionStatus?.subscription?.currentPeriodEnd);

  const action = (id) => {
    const tier = SUBSCRIPTION_TIERS[id];
    const className = `btn btn-lg w-full ${id === RECOMMENDED_TIER ? 'btn-primary' : 'btn-secondary'}`;

    if (id === 'free') {
      return isSignedIn ? (
        <Link href="/resume-analysis" className={className}>Analyze resume</Link>
      ) : (
        <Link href="/sign-up" className={className}>Start free</Link>
      );
    }
    if (!isSignedIn) {
      return (
        <Link href={`/sign-up?redirect_url=${encodeURIComponent('/#pricing')}`} className={className}>
          Get {tier.name}
        </Link>
      );
    }
    return (
      <button type="button" onClick={() => setCheckoutTier(id)} className={className}>
        Get {tier.name}
      </button>
    );
  };

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-16 py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-[60ch]">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-accent">Pricing</p>
          <h2 id="pricing-title" className="mt-3 text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink md:text-4xl md:leading-[42px]">
            Start free. Pay when you need more.
          </h2>
          <p className="mt-3 text-lg leading-7 text-ink-2">
            Every plan includes all three tools. Paid plans raise the monthly limits and the file size.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIER_IDS.map((id) => {
            const tier = SUBSCRIPTION_TIERS[id];
            const recommended = id === RECOMMENDED_TIER;

            return (
              <div
                key={id}
                className={`relative flex flex-col rounded-panel bg-surface p-6 sm:p-8 ${
                  recommended
                    ? 'order-first shadow-[inset_0_0_0_1.5px_var(--color-accent)] lg:order-none'
                    : 'shadow-[inset_0_0_0_1px_var(--color-line)]'
                }`}
              >
                {recommended && <span className="badge absolute top-6 right-6 sm:top-8 sm:right-8">Recommended</span>}
                <h3 className="text-xl font-semibold tracking-tight text-ink">{tier.name}</h3>
                <p className="mt-1 text-[15px] text-ink-3">{tier.description}</p>

                <p className="mt-6 text-[44px] leading-[48px] font-semibold tracking-[-0.02em] text-ink tabular-nums">
                  ₹{tier.price}
                </p>
                <p className="mt-1 text-sm text-ink-3">
                  {tier.price > 0 ? `for ${PAID_PERIOD_DAYS} days` : 'No card needed'}
                </p>

                <div className="mt-6">{action(id)}</div>
                {currentTier === id && (
                  <p className="mt-2 text-center text-[13px] text-ink-3">
                    {id === 'free' || !currentEnd
                      ? 'Your current plan'
                      : `Your plan, active until ${currentEnd}. Buying again adds ${PAID_PERIOD_DAYS} days.`}
                  </p>
                )}

                <ul className="mt-6 space-y-3 border-t border-line pt-6 text-[15px] text-ink-2">
                  {getTierFeatures(id).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-ink-3">
          One-time payment. No auto-renewal. Pay again only if you need more time. Payments processed by Razorpay.
        </p>
      </div>

      <CheckoutModal tierId={checkoutTier} onClose={() => setCheckoutTier(null)} />
    </section>
  );
}
