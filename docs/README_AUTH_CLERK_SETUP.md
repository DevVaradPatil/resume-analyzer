# Clerk Authentication Setup Guide

This guide explains how to set up Clerk as the authentication provider for the Resume Analyzer application.

## Overview

This project uses **Clerk** for authentication and user management. User data is synced to **Supabase** via webhooks.

## 1. Create a Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign in or create an account
2. Click **Add application**
3. Enter your application name: `Resume Analyzer` (or your preferred name)
4. Select the authentication methods you want to enable:
   - ✅ Email (recommended)
   - ✅ Google
   - ✅ GitHub
   - ✅ LinkedIn
5. Click **Create application**

## 2. Configure OAuth Providers

### Google OAuth

1. In Clerk dashboard, go to **User & Authentication** → **Social connections**
2. Click **Google**
3. Toggle **Enable** to ON
4. For development, Clerk provides shared credentials
5. For production:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-app.clerk.accounts.dev/v1/oauth_callback`
   - Enter Client ID and Client Secret in Clerk

### GitHub OAuth

1. In Clerk dashboard, go to **Social connections**
2. Click **GitHub**
3. Toggle **Enable** to ON
4. For production:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create a new OAuth App
   - Authorization callback URL: `https://your-app.clerk.accounts.dev/v1/oauth_callback`
   - Enter Client ID and Client Secret in Clerk

### LinkedIn OAuth

1. In Clerk dashboard, go to **Social connections**
2. Click **LinkedIn**
3. Toggle **Enable** to ON
4. For production:
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create an app
   - Add OAuth 2.0 redirect URL: `https://your-app.clerk.accounts.dev/v1/oauth_callback`
   - Enter Client ID and Client Secret in Clerk

## 3. Get Your API Keys

1. In Clerk dashboard, go to **Developers** → **API Keys**
2. Copy the following values:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

## 4. Configure Webhooks

Webhooks sync user data from Clerk to Supabase when users sign up or update their profile.

### Set Up Webhook Endpoint

1. In Clerk dashboard, go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Configure:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - For local development with ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
4. Select events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click **Create**
6. Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`

### Local Development with ngrok

To test webhooks locally:

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. Expose your local server: `ngrok http 3000`
4. Use the ngrok URL for your webhook endpoint

## 5. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs (optional - defaults work for most cases)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/resume-analysis
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/resume-analysis
```

## 6. Configure Allowed Redirect URLs

In Clerk dashboard, go to **Paths** and configure:

1. **Sign-in URL**: `/sign-in`
2. **Sign-up URL**: `/sign-up`
3. **After sign-in URL**: `/resume-analysis`
4. **After sign-up URL**: `/resume-analysis`

For production, add your domain to **Allowed domains** under **Settings**.

## Route Protection

### Protected Routes

The following routes require authentication (configured in `middleware.js`):

- `/resume-analysis/*`
- `/analytics/*`
- `/section-improvement/*`
- `/dashboard/*`
- `/api/analyze/*`
- `/api/analyze-overall/*`
- `/api/improve-section/*`

### Public Routes

- `/` (landing page)
- `/sign-in/*`
- `/sign-up/*`
- `/blog/*`
- `/api/webhooks/clerk`

## Authentication Flow

1. **User visits protected route** → Redirected to `/sign-in`
2. **User signs in/up** → Clerk handles authentication
3. **On successful auth** → User redirected to `/resume-analysis`
4. **Webhook fires** → User synced to Supabase database
5. **API requests** → Verified via Clerk middleware

## Using Authentication in Code

### Server Components (App Router)

```javascript
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    // Handle unauthenticated state
  }
  
  return <div>Hello, {user.firstName}!</div>;
}
```

### API Routes

```javascript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Handle authenticated request
}
```

### Client Components

```javascript
'use client';

import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Component() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  return (
    <>
      <SignedIn>
        <p>Hello, {user.firstName}!</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </SignedIn>
      
      <SignedOut>
        <a href="/sign-in">Sign In</a>
      </SignedOut>
    </>
  );
}
```

## User Data Sync

When a user signs up or updates their profile:

1. Clerk sends a webhook to `/api/webhooks/clerk`
2. The webhook handler verifies the signature using `svix`
3. User data is upserted to Supabase `users` table
4. Fields synced:
   - `clerk_user_id`
   - `email`
   - `name` (firstName + lastName)
   - `avatar_url`

## Customizing the UI

### Sign In/Up Pages

The sign-in and sign-up pages use Clerk's pre-built components with custom styling.

Location:
- `/src/app/sign-in/[[...sign-in]]/page.js`
- `/src/app/sign-up/[[...sign-up]]/page.js`

You can customize the appearance using the `appearance` prop:

```javascript
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
      card: 'shadow-xl',
    },
  }}
/>
```

### Header Component

The `Header` component shows:
- User avatar and name when signed in
- Dropdown menu with navigation and sign out
- Sign In/Sign Up buttons when signed out

## Troubleshooting

### "Authentication required" errors

1. Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
2. Verify the middleware is configured correctly
3. Check the route isn't in the protected routes list

### Webhook not syncing users

1. Verify `CLERK_WEBHOOK_SECRET` is correct
2. Check the webhook URL is accessible
3. Look at Clerk dashboard → Webhooks → Logs for errors
4. For local dev, ensure ngrok is running

### OAuth providers not working

1. Verify the provider is enabled in Clerk dashboard
2. For production, ensure OAuth credentials are configured
3. Check redirect URIs match your domain

### User not in Supabase after sign up

1. Check webhook is configured with correct events
2. Verify Supabase environment variables are set
3. Check API logs for database errors
4. Ensure `users` table exists (run schema.sql)

## Security Best Practices

1. **Protect all sensitive routes** - Already configured in middleware
2. **Validate tokens server-side** - Use `auth()` in API routes
3. **Never trust client-side auth alone** - Always verify on server
4. **Use HTTPS in production** - Required for OAuth callbacks
5. **Rotate keys if compromised** - Generate new keys in Clerk dashboard

## Production Checklist

- [ ] Set production environment variables
- [ ] Configure production domain in Clerk
- [ ] Set up OAuth credentials with production URLs
- [ ] Configure webhook with production URL
- [ ] Test all OAuth providers
- [ ] Verify user sync works
- [ ] Test protected routes redirect correctly
