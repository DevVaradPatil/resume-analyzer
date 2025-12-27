# Razorpay Production Setup Guide

This guide outlines the steps to switch your Razorpay integration from Test mode to Live (Production) mode.

## 1. Razorpay Dashboard Actions

1.  **Login to Razorpay Dashboard**: Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/).
2.  **Activate Account**:
    *   If you haven't already, complete the account activation process.
    *   Submit KYC documents, business details, and bank account information.
    *   Wait for the Razorpay team to approve your account (usually takes 2-3 business days).
3.  **Switch to Live Mode**:
    *   Once approved, toggle the mode switch in the top-right corner from "Test Mode" to "Live Mode".
4.  **Generate Live Keys**:
    *   Go to **Settings** -> **API Keys**.
    *   Click **Generate Key** (in Live Mode).
    *   **IMPORTANT**: Copy the `Key ID` and `Key Secret` immediately. You won't be able to see the secret again.
5.  **Branding (Optional but Recommended)**:
    *   Go to **Settings** -> **Branding**.
    *   Upload your logo and set your brand color. This will appear on the payment popup.

## 2. Environment Variables Update

You need to update your environment variables in your hosting provider (e.g., Vercel, Netlify) and your local `.env.local` file if you want to test production keys locally (be careful with real money!).

Update the following variables with the **Live Keys** you generated in step 1.4:

```env
# Razorpay Live Keys
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: Live keys usually start with `rzp_live_`, while test keys start with `rzp_test_`.

## 3. Verification

1.  **Deploy**: Deploy your changes to production.
2.  **Test a Real Payment**:
    *   Go to your live website.
    *   Select a paid plan (e.g., Pro).
    *   The Razorpay popup should appear.
    *   **Verify the Mode**: The popup should **NOT** have a "Test Mode" banner at the top.
    *   Make a small real payment (you can refund it later from the dashboard).
3.  **Check Dashboard**:
    *   Verify that the payment appears in the **Transactions** tab of your Razorpay Dashboard (in Live Mode).

## 4. Refunds (If testing with real money)

If you tested with your own card:
1.  Go to the Razorpay Dashboard (Live Mode).
2.  Find the transaction.
3.  Click on it and select **Refund**.
4.  Process a full refund.

## Troubleshooting

*   **"Razorpay keys are missing"**: Ensure you have added the environment variables to your production deployment settings.
*   **"Invalid Key Id"**: Double-check that you copied the Live Key ID correctly and there are no extra spaces.
*   **Test Mode Banner**: If you still see the "Test Mode" banner, you are still using the `rzp_test_` keys. Clear your cache and verify your environment variables.
