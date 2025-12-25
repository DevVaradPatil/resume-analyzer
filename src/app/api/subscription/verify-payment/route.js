import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { updateSubscriptionTier } from '../../../../lib/subscription-service';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tier
    } = await request.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update user subscription
      await updateSubscriptionTier(userId, tier);

      return NextResponse.json({
        status: 'success',
        message: 'Payment verified and subscription updated'
      });
    } else {
      return NextResponse.json(
        { status: 'error', error: 'Invalid signature' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
