import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getSupabaseAdminClient } from '../../../../lib/supabaseClient';
import {
  SUBSCRIPTION_TIERS,
  updateSubscriptionTier,
} from '../../../../lib/subscription-service';

/**
 * Timing-safe comparison of two hex signatures.
 */
function signaturesMatch(expected, received) {
  if (typeof received !== 'string' || expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('Razorpay keys are missing');
    return NextResponse.json(
      { status: 'error', error: 'Server configuration error' },
      { status: 500 }
    );
  }

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
      // NOTE: any `tier` in the request body is deliberately ignored. The tier
      // is read back from the Razorpay order, which only this server can write.
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { status: 'error', error: 'Missing payment parameters' },
        { status: 400 }
      );
    }

    // 1. Verify the signature. This proves the order/payment pair came from
    //    Razorpay -- but says nothing about what was purchased or by whom.
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!signaturesMatch(expectedSignature, razorpay_signature)) {
      console.warn(`Invalid payment signature for user ${userId}, order ${razorpay_order_id}`);
      return NextResponse.json(
        { status: 'error', error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 2. Fetch the order from Razorpay. Its `notes` were written by
    //    create-order on the server, so they are authoritative.
    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (fetchError) {
      console.error('Error fetching Razorpay order:', fetchError);
      return NextResponse.json(
        { status: 'error', error: 'Could not verify order with payment provider' },
        { status: 502 }
      );
    }

    // 3. The order must belong to the caller. Without this, one user's valid
    //    payment could be replayed by another account.
    if (order?.notes?.userId !== userId) {
      console.warn(
        `Order ownership mismatch: order ${razorpay_order_id} belongs to ` +
        `${order?.notes?.userId}, claimed by ${userId}`
      );
      return NextResponse.json(
        { status: 'error', error: 'Order does not belong to this user' },
        { status: 403 }
      );
    }

    // 4. The tier comes from the order, never from the request body.
    const tier = order?.notes?.tier;
    const tierConfig = SUBSCRIPTION_TIERS[tier];

    if (!tierConfig || tier === 'free') {
      console.error(`Order ${razorpay_order_id} carries an invalid tier: ${tier}`);
      return NextResponse.json(
        { status: 'error', error: 'Invalid subscription tier on order' },
        { status: 400 }
      );
    }

    // 5. The order must actually be paid, for the tier's real price.
    if (order.status !== 'paid') {
      return NextResponse.json(
        { status: 'error', error: `Order is not paid (status: ${order.status})` },
        { status: 400 }
      );
    }

    const expectedAmount = Math.round(tierConfig.price * 100); // paise
    if (Number(order.amount_paid) !== expectedAmount) {
      console.warn(
        `Amount mismatch on order ${razorpay_order_id}: paid ${order.amount_paid}, ` +
        `expected ${expectedAmount} for tier ${tier}`
      );
      return NextResponse.json(
        { status: 'error', error: 'Paid amount does not match the selected plan' },
        { status: 400 }
      );
    }

    // 6. Confirm the payment itself was captured, not merely authorised.
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (fetchError) {
      console.error('Error fetching Razorpay payment:', fetchError);
      return NextResponse.json(
        { status: 'error', error: 'Could not verify payment with payment provider' },
        { status: 502 }
      );
    }

    if (payment?.status !== 'captured' || payment?.order_id !== razorpay_order_id) {
      return NextResponse.json(
        { status: 'error', error: `Payment is not captured (status: ${payment?.status})` },
        { status: 400 }
      );
    }

    // 7. Claim this payment id before granting anything. The UNIQUE constraint
    //    on razorpay_payment_id makes a replayed payment fail here.
    const supabase = getSupabaseAdminClient();

    const { error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        clerk_user_id: userId,
        razorpay_payment_id,
        razorpay_order_id,
        tier,
        amount: Number(order.amount_paid),
        currency: order.currency || 'INR',
      });

    if (insertError) {
      // 23505 = unique_violation: this payment was already redeemed.
      if (insertError.code === '23505') {
        return NextResponse.json(
          { status: 'error', error: 'This payment has already been processed' },
          { status: 409 }
        );
      }

      console.error('Error recording payment transaction:', insertError);
      return NextResponse.json(
        { status: 'error', error: 'Could not record payment' },
        { status: 500 }
      );
    }

    // 8. Only now grant the tier.
    const subscription = await updateSubscriptionTier(userId, tier, {
      paymentProvider: 'razorpay',
      paymentCustomerId: payment?.customer_id || null,
    });

    // Backfill the period this payment bought, for support and reconciliation.
    await supabase
      .from('payment_transactions')
      .update({
        period_start: subscription.current_period_start,
        period_end: subscription.current_period_end,
      })
      .eq('razorpay_payment_id', razorpay_payment_id);

    return NextResponse.json({
      status: 'success',
      message: 'Payment verified and subscription updated',
      data: {
        tier: subscription.tier,
        currentPeriodEnd: subscription.current_period_end,
      },
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { status: 'error', error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
