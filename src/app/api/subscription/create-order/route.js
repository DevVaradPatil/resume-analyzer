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
    
    // Create Razorpay order
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
