/**
 * Runs one Razorpay checkout for a paid tier, end to end.
 *
 * Resolves with { status: 'success', tier, currentPeriodEnd } once the server
 * has verified the payment and granted the tier, or { status: 'dismissed' } if
 * the user closed Razorpay without paying. Throws on anything else, with
 * `paid: true` on the error when money may have moved but verification failed.
 *
 * The tier is never sent to verify-payment: the server reads it back from the
 * Razorpay order, which the client cannot forge.
 */
export async function payForTier(tierId, { description } = {}) {
  const orderResponse = await fetch('/api/subscription/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: tierId }),
  });
  const order = await orderResponse.json();
  if (order.status !== 'success') {
    throw new Error(order.error || 'Failed to create order');
  }
  if (typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Razorpay checkout did not load');
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'ResumeInsight',
      description,
      order_id: order.orderId,
      theme: { color: '#1B6B8F' },
      modal: { ondismiss: () => resolve({ status: 'dismissed' }) },
      handler: async (payment) => {
        try {
          const verifyResponse = await fetch('/api/subscription/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            }),
          });
          const verified = await verifyResponse.json();
          if (verified.status !== 'success') {
            throw new Error(verified.error || 'Payment verification failed');
          }
          resolve({ status: 'success', ...verified.data });
        } catch (error) {
          error.paid = true;
          reject(error);
        }
      },
    });
    razorpay.open();
  });
}
