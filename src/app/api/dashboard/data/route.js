import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteAllUserAnalysisData } from '../../../../lib/resume-service';

/**
 * Erases every analysis record belonging to the signed-in user.
 *
 * Lives under /api/dashboard/* so it inherits the existing protected matcher
 * in src/middleware.js, and still performs its own auth() check.
 *
 * This deletes stored resumes and analysis logs. It does not delete the Clerk
 * account or the mirrored users row -- the user stays signed in with an empty
 * history. Account deletion goes through Clerk, whose user.deleted webhook
 * cascades the rest.
 */
export async function DELETE(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }

    const deletedCount = await deleteAllUserAnalysisData(userId);

    console.log(`Erased analysis data for ${userId}: ${deletedCount} resumes`);

    return NextResponse.json({
      status: 'success',
      message: 'All analysis data deleted',
      data: { deletedCount },
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to delete your data. Please try again.' },
      { status: 500 }
    );
  }
}
