'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useSubscription } from './SubscriptionProvider';
import { SUBSCRIPTION_TIERS, PAID_PERIOD_DAYS, getTierFeatures } from '../lib/tiers';
import { payForTier } from '../lib/checkout';

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDate = (date) =>
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * The step between choosing a plan and Razorpay (DESIGN.md 8.3), and the
 * success state after it. Rendered inside whichever modal the user is in.
 *
 * @param {string} tierId - 'pro' | 'executive'
 * @param {string} titleId - id for the heading, so the host dialog can label itself
 * @param {Function} [onBack] - back to plan choice; omitted when there is none
 * @param {Function} onDone - called after "Continue" on the success state
 */
export default function CheckoutConfirm({ tierId, titleId, onBack, onDone }) {
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscription();
  const [state, setState] = useState('confirm'); // confirm | paying | success | error | unconfirmed
  const [error, setError] = useState(null);
  const [activeUntil, setActiveUntil] = useState(null);

  const tier = SUBSCRIPTION_TIERS[tierId];
  if (!tier) return null;

  // Mirrors updateSubscriptionTier: buying the plan you already have while it
  // is running adds the days to its end; anything else starts today.
  const current = subscriptionStatus?.subscription;
  const currentEnd = current?.currentPeriodEnd ? new Date(current.currentPeriodEnd) : null;
  const extends_ = current?.tier === tierId && currentEnd && currentEnd > new Date();
  const validUntil = new Date((extends_ ? currentEnd.getTime() : Date.now()) + PAID_PERIOD_DAYS * DAY_MS);

  const pay = async () => {
    setState('paying');
    setError(null);
    try {
      const result = await payForTier(tierId, { description: `${tier.name} plan, ${PAID_PERIOD_DAYS} days` });
      if (result.status === 'dismissed') {
        setState('confirm');
        return;
      }
      const end = result.currentPeriodEnd ? new Date(result.currentPeriodEnd) : validUntil;
      setActiveUntil(Number.isNaN(end.getTime()) ? validUntil : end);
      setState('success');
      refreshSubscriptionStatus?.();
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(
        err.paid
          ? "We couldn't confirm your payment. If money left your account, don't pay again: contact support with the time of payment and we will sort it out."
          : "Payment couldn't start. Nothing was charged."
      );
      // A verification failure may follow a real charge, so it must not offer
      // a second payment.
      setState(err.paid ? 'unconfirmed' : 'error');
    }
  };

  if (state === 'success') {
    return (
      <div className="p-6 sm:p-8" aria-live="polite">
        <p className="flex items-center gap-2 text-sm font-medium text-positive">
          <Check size={18} strokeWidth={1.75} aria-hidden="true" />
          Payment received
        </p>
        <h2 id={titleId} className="mt-2 text-xl font-semibold tracking-tight text-ink">
          Your {tier.name} plan is active
        </h2>
        <p className="mt-2 text-ink-2">
          Active until <span className="font-medium text-ink">{formatDate(activeUntil)}</span>.
        </p>
        <button type="button" onClick={onDone} className="btn btn-primary btn-lg mt-6 w-full">
          Continue
        </button>
      </div>
    );
  }

  const busy = state === 'paying';

  return (
    <div className="p-6 sm:p-8">
      {onBack && (
        <button type="button" onClick={onBack} disabled={busy || state === 'unconfirmed'} className="btn btn-ghost -ml-3 mb-3 h-8 px-3 text-sm">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          All plans
        </button>
      )}

      <h2 id={titleId} className="text-xl font-semibold tracking-tight text-ink">
        {tier.name} plan
      </h2>
      <ul className="mt-3 space-y-1.5 text-[15px] text-ink-2">
        {getTierFeatures(tierId).slice(0, 2).map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Check size={16} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-3" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>

      <dl className="mt-6 divide-y divide-line border-y border-line text-[15px]">
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-ink-3">Price</dt>
          <dd className="font-semibold text-ink tabular-nums">₹{tier.price}</dd>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-ink-3">{extends_ ? 'New end date' : 'Valid until'}</dt>
          <dd className="text-ink tabular-nums">{formatDate(validUntil)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-ink-3">
        One-time payment for {PAID_PERIOD_DAYS} days{extends_ ? ', added to your current plan' : ''}. No auto-renewal.
      </p>

      {error && (
        <p role="alert" className="mt-4 border-l-[3px] border-critical pl-3 text-sm text-ink-2">
          {error}
        </p>
      )}

      {state === 'unconfirmed' ? (
        <button type="button" onClick={onDone} className="btn btn-secondary btn-lg mt-6 w-full">
          Close
        </button>
      ) : (
        <>
          <button type="button" onClick={pay} disabled={busy} className="btn btn-primary btn-lg mt-6 w-full">
            {busy && <Loader2 size={18} strokeWidth={1.75} className="motion-safe:animate-spin" aria-hidden="true" />}
            {busy ? 'Opening Razorpay' : state === 'error' ? 'Try again' : `Pay ₹${tier.price}`}
          </button>
          <p className="mt-3 text-center text-[13px] text-ink-3">Secured by Razorpay</p>
        </>
      )}
    </div>
  );
}
