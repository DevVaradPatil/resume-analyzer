import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSubscriptionStatus, hasSubscription, getOrCreateSubscription } from '../../../../lib/subscription-service';
import { getOrCreateUser } from '../../../../lib/user-sync';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Ensure user exists in database
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
    
    const status = await getSubscriptionStatus(userId);
    
    return NextResponse.json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
