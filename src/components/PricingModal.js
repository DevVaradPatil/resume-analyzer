'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Rocket, Crown, Sparkles } from 'lucide-react';
import AlertModal from './AlertModal';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Get started with basic features',
    icon: Zap,
    iconColor: 'text-slate-600',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
    buttonStyle: 'bg-slate-800 text-white hover:bg-slate-900',
    features: [
      '1 Job Match Analysis/month',
      '1 Resume Analytics/month',
      '1 Section Improvement/month',
      'Max 2MB file size',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    description: 'Best for active job seekers',
    icon: Rocket,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    popular: true,
    features: [
      '50 Job Match Analyses/month',
      '50 Resume Analytics/month',
      '100 Section Improvements/month',
      'Max 10MB file size',
      'Priority support',
    ],
  },
  {
    id: 'executive',
    name: 'Executive',
    price: 999,
    description: 'Unlimited access for professionals',
    icon: Crown,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700',
    features: [
      'Unlimited analyses',
      'Max 25MB file size',
      'Premium ATS optimization',
      '24/7 Priority support',
      'Custom recommendations',
    ],
  },
];

export default function PricingModal({ 
  isOpen, 
  onClose, 
  onSelectTier,
  isOnboarding = false,
}) {
  const [selectedTier, setSelectedTier] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, type: 'success', message: '' });

  if (!isOpen) return null;

  const handleContinue = async () => {
    setIsLoading(true);
    
    if (selectedTier === 'free') {
      // For free tier, just initialize and continue
      try {
        const response = await fetch('/api/subscription/init', {
          method: 'POST',
        });
        
        if (response.ok) {
          if (onSelectTier) {
            onSelectTier(selectedTier);
          }
          onClose();
        }
      } catch (error) {
        console.error('Error initializing subscription:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For paid tiers, open payment gateway
      try {
        // 1. Create Order
        const response = await fetch('/api/subscription/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier: selectedTier }),
        });

        const data = await response.json();

        if (data.status !== 'success') {
          throw new Error(data.error || 'Failed to create order');
        }

        // 2. Initialize Razorpay
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'Resume Analyzer',
          description: `${PRICING_TIERS.find(t => t.id === selectedTier).name} Subscription`,
          order_id: data.orderId,
          handler: async function (response) {
            try {
              // 3. Verify Payment
              const verifyResponse = await fetch('/api/subscription/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  tier: selectedTier,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.status === 'success') {
                setAlertState({ isOpen: true, type: 'success', message: 'Subscription updated successfully!' });
                
                setTimeout(() => {
                  if (onSelectTier) {
                    onSelectTier(selectedTier);
                  }
                  onClose();
                  // Optionally refresh the page or update context
                  window.location.reload();
                }, 2000);
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              setAlertState({ isOpen: true, type: 'error', message: 'Payment verification failed. Please contact support.' });
            }
          },
          theme: {
            color: '#2563eb',
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();

      } catch (error) {
        console.error('Payment initialization error:', error);
        setAlertState({ isOpen: true, type: 'error', message: 'Failed to initialize payment. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isOnboarding ? undefined : onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          {/* Close button (hidden during onboarding) */}
          {!isOnboarding && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="p-6 sm:p-8 text-center border-b border-slate-200">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              {isOnboarding ? 'Welcome to ResumeInsight!' : 'Choose Your Plan'}
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">
              {isOnboarding 
                ? 'Select a plan to get started. You can always upgrade later.'
                : 'Unlock more features with our premium plans.'}
            </p>
          </div>

          {/* Plans */}
          <div className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-4">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                    selectedTier === tier.id
                      ? `${tier.borderColor} ${tier.bgColor} ring-2 ring-offset-2 ${
                          tier.id === 'pro' ? 'ring-blue-400' : 
                          tier.id === 'executive' ? 'ring-purple-400' : 'ring-slate-400'
                        }`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <tier.icon className={`w-5 h-5 ${tier.iconColor}`} />
                    <h3 className="text-lg font-bold text-slate-800">{tier.name}</h3>
                  </div>

                  <p className="text-sm text-slate-500 mb-3">{tier.description}</p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-slate-800">₹{tier.price}</span>
                    {tier.price > 0 && (
                      <span className="text-slate-500 text-sm">/month</span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Selection indicator */}
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedTier === tier.id
                      ? 'border-green-500 bg-green-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedTier === tier.id && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-8 border-t border-slate-200 bg-slate-50">
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                PRICING_TIERS.find(t => t.id === selectedTier)?.buttonStyle
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                selectedTier === 'free' ? 'Start with Free Plan' : `Continue with ${PRICING_TIERS.find(t => t.id === selectedTier)?.name}`
              )}
            </button>
            <p className="text-center text-sm text-slate-500 mt-4">
              {selectedTier === 'free' 
                ? 'No credit card required. Upgrade anytime.'
                : 'Secure payment. Cancel anytime.'}
            </p>
          </div>
        </motion.div>
      </div>
      <AlertModal 
        isOpen={alertState.isOpen} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
        type={alertState.type} 
        message={alertState.message} 
      />
    </AnimatePresence>
  );
}
