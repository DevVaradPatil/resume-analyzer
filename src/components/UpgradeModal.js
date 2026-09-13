"use client";

import React, { useId, useState } from "react";
import { X, Check } from "lucide-react";
import CheckoutConfirm from "./CheckoutConfirm";
import { useModalA11y } from "../hooks/useModalA11y";
import { SUBSCRIPTION_TIERS, PAID_PERIOD_DAYS, getTierFeatures } from "../lib/tiers";
import { formatBytes } from "../lib/file-validation";

const UPGRADE_TIER_IDS = ["pro", "executive"];
const RECOMMENDED_TIER = "pro";

// Human-readable names for the internal feature keys.
const FEATURE_LABELS = {
  analyze: "job match",
  analytics: "resume analytics",
  improve: "section improvement",
};

const formatResetDate = (iso) => {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
};

export default function UpgradeModal({
  isOpen,
  onClose,
  reason = "LIMIT_REACHED",
  featureType = "analyze",
  currentTier = "free",
  usageInfo = null,
}) {
  const [checkoutTier, setCheckoutTier] = useState(null);

  const titleId = useId();
  const descId = useId();
  const dialogRef = useModalA11y(isOpen, () => close());

  if (!isOpen) return null;

  const close = () => {
    setCheckoutTier(null);
    onClose();
  };

  const featureName = FEATURE_LABELS[featureType] || featureType;

  const getReasonMessage = () => {
    if (reason === "FILE_TOO_LARGE") {
      const max = formatBytes(usageInfo?.maxSize);
      const current = formatBytes(usageInfo?.currentSize);
      const tierName = SUBSCRIPTION_TIERS[usageInfo?.tier]?.name;

      return {
        title: "This file is too large",
        message:
          max && current && tierName
            ? `Your file is ${current}. The ${tierName} plan accepts PDFs up to ${max}.`
            : "This file is over the size limit for your current plan.",
      };
    }

    if (reason === "LIMIT_REACHED") {
      const { used, limit } = usageInfo || {};
      const reset = formatResetDate(usageInfo?.resetDate);
      const count =
        typeof used === "number" && typeof limit === "number" && limit > 0
          ? `You have used ${used} of ${limit} ${featureName} ${limit === 1 ? "run" : "runs"} this month.`
          : `You have used this month's ${featureName} runs.`;

      return {
        title: "Monthly limit reached",
        message: reset ? `${count} More become available on ${reset}.` : count,
      };
    }

    return {
      title: "Upgrade your plan",
      message: "Paid plans raise your monthly limits and file size.",
    };
  };

  const reasonInfo = getReasonMessage();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 scrim animate-fadeIn" onClick={close} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={checkoutTier ? undefined : descId}
        tabIndex={-1}
        className="panel relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-overlay outline-none animate-slideIn"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="btn btn-ghost absolute top-3 right-3 h-8 w-8 px-0"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {checkoutTier ? (
          <CheckoutConfirm
            tierId={checkoutTier}
            titleId={titleId}
            onBack={() => setCheckoutTier(null)}
            onDone={close}
          />
        ) : (
          <>
          <div className="p-6 pr-14">
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-ink">
              {reasonInfo.title}
            </h2>
            <p id={descId} className="mt-2 text-ink-2">
              {reasonInfo.message}
            </p>
          </div>

          <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
            {UPGRADE_TIER_IDS.filter((id) => id !== currentTier).map((id) => {
              const tier = SUBSCRIPTION_TIERS[id];
              const recommended = id === RECOMMENDED_TIER;

              return (
                <div
                  key={id}
                  className={`relative flex flex-col rounded-panel bg-surface p-5 ${
                    recommended
                      ? "shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
                      : "shadow-[inset_0_0_0_1px_var(--color-line)]"
                  }`}
                >
                  {recommended && (
                    <span className="badge absolute top-4 right-4">Recommended</span>
                  )}

                  <h3 className="text-base font-semibold text-ink">{tier.name}</h3>
                  <p className="mt-0.5 text-sm text-ink-3">{tier.description}</p>

                  <p className="mt-4">
                    <span className="text-3xl font-semibold tracking-tight text-ink tabular-nums">
                      ₹{tier.price}
                    </span>
                    <span className="ml-1.5 text-sm text-ink-3">for {PAID_PERIOD_DAYS} days</span>
                  </p>

                  <ul className="mt-4 mb-5 space-y-2 text-sm text-ink-2">
                    {getTierFeatures(id).map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => setCheckoutTier(id)}
                    className={`btn mt-auto w-full ${recommended ? "btn-primary" : "btn-secondary"}`}
                  >
                    Get {tier.name}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="border-t border-line px-6 py-4 text-center text-[13px] text-ink-3">
            Payments are processed securely by Razorpay.
          </p>

          </>
        )}
      </div>
    </div>
  );
}
