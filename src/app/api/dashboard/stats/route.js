import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserStats, getUserResumes } from '../../../../lib/resume-service';

export async function GET(request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch user stats and recent analyses in parallel
    const [stats, recentAnalyses] = await Promise.all([
      getUserStats(userId).catch((error) => {
        console.error('Error fetching user stats:', error);
        return {
          totalResumes: 0,
          totalAnalyses: 0,
          averageScore: 0,
          lastAnalysisAt: null,
        };
      }),
      getUserResumes(userId, { limit: 10 }).catch((error) => {
        console.error('Error fetching recent analyses:', error);
        return [];
      }),
    ]);
    
    return NextResponse.json({
      status: 'success',
      data: {
        stats: {
          totalResumes: stats?.totalResumes ?? 0,
          totalAnalyses: stats?.totalAnalyses ?? 0,
          averageScore: stats?.averageScore ?? 0,
          lastAnalysisAt: stats?.lastAnalysisAt ?? null,
        },
        recentAnalyses: recentAnalyses ?? [],
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    // Return safe defaults on error
    return NextResponse.json({
      status: 'success',
      data: {
        stats: {
          totalResumes: 0,
          totalAnalyses: 0,
          averageScore: 0,
          lastAnalysisAt: null,
        },
        recentAnalyses: [],
      },
    });
  }
}
