import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { hasSubscription, getOrCreateSubscription } from '../../../../lib/subscription-service';
import { getOrCreateUser } from '../../../../lib/user-sync';

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Ensure user exists in database first
    const user = await currentUser();
    if (user) {
      await getOrCreateUser({
        id: userId,
        emailAddresses: user.emailAddresses,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });
    }
    
    const hasExistingSubscription = await hasSubscription(userId);
    
    return NextResponse.json({
      status: 'success',
      data: {
        hasSubscription: hasExistingSubscription,
        needsOnboarding: !hasExistingSubscription,
      },
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Ensure user exists
    const user = await currentUser();
    if (user) {
      await getOrCreateUser({
        id: userId,
        emailAddresses: user.emailAddresses,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });
    }
    
    // Create subscription (starts with free tier)
    const subscription = await getOrCreateSubscription(userId);
    
    return NextResponse.json({
      status: 'success',
      data: {
        subscription,
        message: 'Subscription initialized successfully',
      },
    });
  } catch (error) {
    console.error('Error initializing subscription:', error);
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
