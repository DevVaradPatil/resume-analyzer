import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getResumeById, deleteResume } from '../../../../../lib/resume-service';

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    const resume = await getResumeById(userId, id);
    
    if (!resume) {
      return NextResponse.json(
        { status: 'error', message: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: {
        id: resume.id,
        fileName: resume.file_name,
        analysisType: resume.analysis_type,
        score: resume.score,
        analysisResult: resume.analysis_result,
        createdAt: resume.created_at,
        updatedAt: resume.updated_at,
      }
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

/**
 * Deletes a single saved analysis.
 *
 * deleteResume scopes the delete by the caller's own users.id, so an id
 * belonging to someone else matches nothing and deletes nothing.
 */
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Confirm it exists and belongs to this user, so a wrong id reports 404
    // rather than silently succeeding.
    const resume = await getResumeById(userId, id);

    if (!resume) {
      return NextResponse.json(
        { status: 'error', message: 'Analysis not found' },
        { status: 404 }
      );
    }

    await deleteResume(userId, id);

    return NextResponse.json({
      status: 'success',
      message: 'Analysis deleted',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
