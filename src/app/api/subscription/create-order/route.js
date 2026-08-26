import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';
import { SUBSCRIPTION_TIERS } from '../../../../lib/subscription-service';

export async function POST(request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('Razorpay keys are missing');
    return NextResponse.json(
      { status: 'error', error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Safety check: Warn if using test keys in production
  if (process.env.NODE_ENV === 'production' && process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test')) {
    console.warn('WARNING: Using Razorpay TEST keys in PRODUCTION environment');
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { tier } = await request.json();

    if (!tier || !SUBSCRIPTION_TIERS[tier]) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier];

    // Amount in paise (1 INR = 100 paise)
    const amount = Math.round(tierConfig.price * 100);

    // Free (or any zero-priced) tier is not a purchase; granting it through the
    // payment flow would produce a paid-for-nothing order that verify-payment
    // would then have to reason about.
    if (amount <= 0) {
      return NextResponse.json(
        { status: 'error', error: 'This plan does not require payment' },
        { status: 400 }
      );
    }

    // Create Razorpay order.
    // `notes` is the server's record of what this order is for. verify-payment
    // reads the tier and owner back from here rather than trusting the client,
    // so these two fields are load-bearing for access control.
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `rcpt_${Math.random().toString(36).substring(2, 10)}`,
      notes: {
        userId: userId,
        tier: tier,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      status: 'success',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
