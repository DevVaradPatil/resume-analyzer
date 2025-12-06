import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { checkFeatureAccess } from '../../../../lib/subscription-service';
import { getOrCreateUser } from '../../../../lib/user-sync';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { featureType, fileSize } = body;
    
    if (!featureType) {
      return NextResponse.json(
        { status: 'error', error: 'featureType is required' },
        { status: 400 }
      );
    }
    
    const validFeatures = ['analyze', 'analytics', 'improve'];
    if (!validFeatures.includes(featureType)) {
      return NextResponse.json(
        { status: 'error', error: `Invalid featureType. Must be one of: ${validFeatures.join(', ')}` },
        { status: 400 }
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
    
    const accessCheck = await checkFeatureAccess(userId, featureType, fileSize || 0);
    
    return NextResponse.json({
      status: 'success',
      data: accessCheck,
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
