'use client';

import React, { useEffect, useState } from 'react';
import { Crown, Zap, Rocket, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionDashboard() {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      
      console.log('SubscriptionDashboard - API Response:', data); // Debug log
      
      if (data.status === 'success' && data.data) {
        console.log('Setting subscription data:', data.data); // Debug log
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'executive':
        return Crown;
      case 'pro':
        return Rocket;
      default:
        return Zap;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'executive':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
          border: 'border-purple-300',
          text: 'text-purple-600',
          iconBg: 'bg-purple-100',
          badge: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
        };
      case 'pro':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-600',
          iconBg: 'bg-blue-100',
          badge: 'bg-blue-600 text-white',
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-slate-200',
          text: 'text-slate-600',
          iconBg: 'bg-slate-100',
          badge: 'bg-slate-600 text-white',
        };
    }
  };

  const tier = subscription?.subscription?.tier || 'free';
  const TierIcon = getTierIcon(tier);
  const colors = getTierColor(tier);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTierName = (tier) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl shadow-lg border-2 ${colors.border} ${colors.bg} p-6 relative overflow-hidden`}
    >
      {/* Background Pattern for Executive */}
      {tier === 'executive' && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${colors.iconBg}`}>
              <TierIcon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Your Plan</h2>
              <p className="text-slate-600 text-sm">Current subscription details</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full ${colors.badge} font-semibold text-sm shadow-md`}>
            {getTierName(tier)} Plan
          </div>
        </div>

        {/* Plan Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-600">Analysis Quota</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {tier === 'executive' ? '∞' : tier === 'pro' ? '50' : '1'}
              <span className="text-sm font-normal text-slate-500 ml-1">/month</span>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Valid Until</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {formatDate(subscription?.subscription?.currentPeriodEnd)}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-600">Status</span>
            </div>
            <div className="text-lg font-bold text-slate-800 capitalize">
              {subscription?.subscription?.status || 'Active'}
            </div>
          </div>
        </div>

        {/* Executive Perks */}
        {tier === 'executive' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Executive Perks</span>
            </div>
            <ul className="space-y-1 text-sm text-purple-100">
              <li>✓ Unlimited analysis across all features</li>
              <li>✓ 25MB file upload limit</li>
              <li>✓ Priority support & advanced insights</li>
              <li>✓ Ad-free experience</li>
            </ul>
          </motion.div>
        )}

        {/* Free Tier CTA */}
        {tier === 'free' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <p className="text-slate-700 mb-3">
              <strong>Upgrade to unlock:</strong> More analyses, larger files, and premium features!
            </p>
            <a
              href="/#pricing"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Plans
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
