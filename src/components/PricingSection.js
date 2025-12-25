'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import AlertModal from './AlertModal';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out our services',
    icon: Zap,
    iconColor: 'text-slate-600',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
    buttonStyle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    features: [
      '1 Job Match Analysis/month',
      '1 Resume Analytics/month',
      '1 Section Improvement/month',
      'Max 2MB file size',
      'Basic ATS scoring',
    ],
    limitations: [
      'Limited to 3 total API calls/month',
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
      'Advanced ATS optimization',
      'Priority support',
      'Detailed industry insights',
    ],
  },
  {
    id: 'executive',
    name: 'Executive',
    price: 999,
    description: 'For professionals who demand the best',
    icon: Crown,
    iconColor: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    borderColor: 'border-purple-300',
    buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700',
    features: [
      'Unlimited Job Match Analyses',
      'Unlimited Resume Analytics',
      'Unlimited Section Improvements',
      'Max 25MB file size',
      'Premium ATS optimization',
      '24/7 Priority support',
      'Executive insights & benchmarks',
      'Custom recommendations',
    ],
  },
];

export default function PricingSection({ onSelectTier, currentTier: propCurrentTier, showTitle = true }) {
  const { isSignedIn } = useUser();
  const [currentTier, setCurrentTier] = useState(propCurrentTier || 'free');
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const [alertState, setAlertState] = useState({ isOpen: false, type: 'success', message: '' });

  useEffect(() => {
    // Fetch actual subscription tier if user is signed in
    const fetchCurrentTier = async () => {
      if (!isSignedIn) {
        setCurrentTier('free');
        setIsLoadingTier(false);
        return;
      }

      try {
        const response = await fetch('/api/subscription/status');
        const data = await response.json();
        
        console.log('PricingSection - API Response:', data); // Debug log
        
        if (data.status === 'success' && data.data?.subscription?.tier) {
          console.log('Setting tier to:', data.data.subscription.tier); // Debug log
          setCurrentTier(data.data.subscription.tier);
        } else {
          console.log('No tier found, defaulting to free'); // Debug log
          setCurrentTier('free');
        }
      } catch (error) {
        console.error('Error fetching tier:', error);
        setCurrentTier('free');
      } finally {
        setIsLoadingTier(false);
      }
    };

    fetchCurrentTier();
  }, [isSignedIn]);

  const handleSelectTier = async (tierId) => {
    if (tierId === 'free') {
      // Free tier doesn't need payment
      if (onSelectTier) {
        onSelectTier(tierId);
      }
    } else {
      // For paid tiers, initiate Razorpay checkout
      try {
        setIsLoadingTier(true);
        
        // 1. Create Order
        const response = await fetch('/api/subscription/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier: tierId }),
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
          description: `${PRICING_TIERS.find(t => t.id === tierId).name} Subscription`,
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
                  tier: tierId,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.status === 'success') {
                setCurrentTier(tierId);
                if (onSelectTier) {
                  onSelectTier(tierId);
                }
                setAlertState({ isOpen: true, type: 'success', message: 'Subscription updated successfully!' });
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              setAlertState({ isOpen: true, type: 'error', message: 'Payment verification failed. Please contact support.' });
            }
          },
          prefill: {
            // We can prefill user details if available
            // name: user.fullName,
            // email: user.primaryEmailAddress.emailAddress,
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
        setIsLoadingTier(false);
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {showTitle && (
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your job search needs. Start free and upgrade as you grow.
            </p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              className={`relative rounded-2xl border-2 ${tier.borderColor} ${tier.bgColor} p-8 flex flex-col ${
                tier.popular ? 'shadow-xl scale-105 z-10' : 'shadow-lg'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${tier.popular ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <tier.icon className={`w-6 h-6 ${tier.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{tier.name}</h3>
              </div>

              <p className="text-slate-600 mb-6">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-800">
                  ₹{tier.price}
                </span>
                {tier.price > 0 && (
                  <span className="text-slate-500 ml-2">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
                {tier.limitations?.map((limitation, limitIndex) => (
                  <li key={`limit-${limitIndex}`} className="flex items-start gap-3 text-slate-500">
                    <span className="w-5 h-5 flex-shrink-0 mt-0.5 text-center">•</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectTier(tier.id)}
                disabled={currentTier === tier.id || isLoadingTier}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  currentTier === tier.id
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : tier.buttonStyle
                }`}
              >
                {isLoadingTier
                  ? 'Loading...'
                  : currentTier === tier.id
                  ? 'Current Plan'
                  : currentTier === 'executive'
                  ? 'Downgrade'
                  : currentTier === 'pro' && tier.id === 'free'
                  ? 'Downgrade'
                  : tier.price === 0
                  ? 'Get Started Free'
                  : 'Upgrade Now'}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-slate-500 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          All plans include secure processing and data protection. Cancel anytime.
        </motion.p>
      </div>

      <AlertModal 
        isOpen={alertState.isOpen} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
        type={alertState.type} 
        message={alertState.message} 
      />
    </section>
  );
}

export { PRICING_TIERS };
