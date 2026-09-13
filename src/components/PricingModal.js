'use client';

import React, { useId, useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import CheckoutConfirm from './CheckoutConfirm';
import { useModalA11y } from '../hooks/useModalA11y';
import { SUBSCRIPTION_TIERS, PAID_PERIOD_DAYS, getTierFeatures } from '../lib/tiers';

const TIER_IDS = ['free', 'pro', 'executive'];
const RECOMMENDED_TIER = 'pro';

export default function PricingModal({
  isOpen,
  onClose,
  onSelectTier,
  isOnboarding = false,
}) {
  const [selectedTier, setSelectedTier] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState(null);

  const titleId = useId();
  const radioName = useId();
  // During onboarding the modal is not dismissible, so Escape must not close
  // it -- passing undefined leaves focus trapped but disables the shortcut.
  const dialogRef = useModalA11y(isOpen, isOnboarding ? undefined : onClose);

  if (!isOpen) return null;

  const selected = SUBSCRIPTION_TIERS[selectedTier];

  const handleContinue = async () => {
    if (selectedTier !== 'free') {
      setCheckoutTier(selectedTier);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/init', { method: 'POST' });
      if (response.ok) {
        onSelectTier?.(selectedTier);
        onClose();
      }
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const finishCheckout = () => {
    const tier = checkoutTier;
    setCheckoutTier(null);
    onSelectTier?.(tier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 scrim animate-fadeIn"
        onClick={isOnboarding ? undefined : onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel relative w-full max-w-[880px] max-h-[90vh] overflow-y-auto shadow-overlay outline-none animate-slideIn"
      >
        {!isOnboarding && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-ghost absolute top-3 right-3 h-8 w-8 px-0"
          >
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}

        {checkoutTier ? (
          <div className="mx-auto max-w-[480px]">
            <CheckoutConfirm
              tierId={checkoutTier}
              titleId={titleId}
              onBack={() => setCheckoutTier(null)}
              onDone={finishCheckout}
            />
          </div>
        ) : (
          <>
          <div className="p-6 pr-14 sm:p-8">
            <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-ink">
              {isOnboarding ? 'Choose a plan to start' : 'Choose your plan'}
            </h2>
            <p className="mt-2 text-ink-2">
              {isOnboarding
                ? 'Start on Free and upgrade whenever you need more.'
                : 'Paid plans raise your monthly limits and file size.'}
            </p>
          </div>

          {/* Native radio inputs: arrow keys, Space and screen readers work
              without any custom handling. */}
          <fieldset className="px-6 sm:px-8">
            <legend className="sr-only">Plan</legend>
            <div className="grid gap-4 md:grid-cols-3">
              {TIER_IDS.map((id) => {
                const tier = SUBSCRIPTION_TIERS[id];
                const isSelected = selectedTier === id;

                return (
                  <label
                    key={id}
                    className={`relative flex cursor-pointer flex-col rounded-panel p-5 transition-shadow ${
                      isSelected
                        ? 'bg-accent-soft/40 shadow-[inset_0_0_0_1.5px_var(--color-accent)]'
                        : 'bg-surface shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={radioName}
                          value={id}
                          checked={isSelected}
                          onChange={() => setSelectedTier(id)}
                          className="h-4 w-4 accent-accent"
                        />
                        <span className="text-base font-semibold text-ink">{tier.name}</span>
                      </span>
                      {id === RECOMMENDED_TIER && <span className="badge">Recommended</span>}
                    </span>

                    <span className="mt-1 text-sm text-ink-3">{tier.description}</span>

                    <span className="mt-4 block">
                      <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
                        ₹{tier.price}
                      </span>
                      {tier.price > 0 && (
                        <span className="ml-1.5 text-sm text-ink-3">for {PAID_PERIOD_DAYS} days</span>
                      )}
                    </span>

                    <ul className="mt-4 space-y-2 text-sm text-ink-2">
                      {getTierFeatures(id).map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 border-t border-line p-6 sm:px-8">
            <button
              type="button"
              onClick={handleContinue}
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading && (
                <Loader2 size={18} strokeWidth={1.75} className="motion-safe:animate-spin" aria-hidden="true" />
              )}
              {isLoading
                ? 'Processing'
                : selectedTier === 'free'
                  ? 'Start free'
                  : `Get ${selected.name}`}
            </button>
            <p className="mt-3 text-center text-[13px] text-ink-3">
              {selectedTier === 'free'
                ? 'No card needed.'
                : 'Payments are processed securely by Razorpay.'}
            </p>
          </div>

          </>
        )}
      </div>
    </div>
  );
}
