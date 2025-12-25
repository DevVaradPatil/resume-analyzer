"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, AlertTriangle, Check, Rocket, Crown } from "lucide-react";
import AlertModal from "./AlertModal";

const UPGRADE_TIERS = [
  {
    id: "pro",
    name: "Pro",
    price: 249,
    icon: Rocket,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
    popular: true,
    features: [
      "50 analyses per feature/month",
      "10MB file size limit",
      "Advanced ATS optimization",
      "Priority support",
    ],
  },
  {
    id: "executive",
    name: "Executive",
    price: 999,
    icon: Crown,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    buttonStyle:
      "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700",
    features: [
      "Unlimited analyses",
      "25MB file size limit",
      "Premium ATS optimization",
      "24/7 Priority support",
    ],
  },
];

export default function UpgradeModal({
  isOpen,
  onClose,
  reason = "LIMIT_REACHED",
  featureType = "analyze",
  currentTier = "free",
  usageInfo = null,
}) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  if (!isOpen) return null;

  const handleUpgrade = async (tierId) => {
    try {
      // 1. Create Order
      const response = await fetch("/api/subscription/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier: tierId }),
      });

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Initialize Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Resume Analyzer",
        description: `${
          UPGRADE_TIERS.find((t) => t.id === tierId)?.name
        } Subscription`,
        order_id: data.orderId,

        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyResponse = await fetch(
              "/api/subscription/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  tier: tierId,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.status === "success") {
              setAlertState({
                isOpen: true,
                type: "success",
                message: "Subscription updated successfully!",
              });

              setTimeout(() => {
                onClose();
                window.location.reload();
              }, 2000);
            } else {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setAlertState({
              isOpen: true,
              type: "error",
              message: "Payment verification failed. Please contact support.",
            });
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      setAlertState({
        isOpen: true,
        type: "error",
        message: "Failed to initialize payment. Please try again.",
      });
    }
  };

  const getReasonMessage = () => {
    switch (reason) {
      case "LIMIT_REACHED":
        return {
          title: "Monthly Limit Reached",
          message: `You've used all your free ${featureType} credits for this month.`,
          icon: AlertTriangle,
          iconColor: "text-amber-500",
        };
      case "FILE_TOO_LARGE":
        return {
          title: "File Size Exceeded",
          message: "Your file exceeds the 2MB limit for the Free tier.",
          icon: AlertTriangle,
          iconColor: "text-amber-500",
        };
      default:
        return {
          title: "Upgrade Required",
          message: "Upgrade to unlock more features and higher limits.",
          icon: Zap,
          iconColor: "text-blue-500",
        };
    }
  };

  const reasonInfo = getReasonMessage();
  const ReasonIcon = reasonInfo.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-slate-100`}>
                <ReasonIcon className={`w-6 h-6 ${reasonInfo.iconColor}`} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                {reasonInfo.title}
              </h2>
            </div>
            <p className="text-slate-600">{reasonInfo.message}</p>

            {usageInfo && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Current usage:</span>{" "}
                  {usageInfo.used}/{usageInfo.limit} {featureType} calls this
                  month
                </p>
              </div>
            )}
          </div>

          {/* Upgrade Options */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Upgrade to continue
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {UPGRADE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative rounded-xl border-2 ${tier.borderColor} ${tier.bgColor} p-5`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <tier.icon className={`w-5 h-5 ${tier.iconColor}`} />
                    <h4 className="text-lg font-bold text-slate-800">
                      {tier.name}
                    </h4>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-800">
                      ₹{tier.price}
                    </span>
                    <span className="text-slate-500 ml-1">/month</span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${tier.buttonStyle}`}
                  >
                    Upgrade to {tier.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <p className="text-center text-sm text-slate-500">
              Cancel anytime. Secure payment processing.
            </p>
          </div>
          <AlertModal
            isOpen={alertState.isOpen}
            onClose={() =>
              setAlertState((prev) => ({ ...prev, isOpen: false }))
            }
            type={alertState.type}
            message={alertState.message}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
