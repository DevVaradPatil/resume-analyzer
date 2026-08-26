import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { improveResumeSectionWithGemini } from '../../../lib/gemini-service';
import { parseGeminiResponse } from '../../../lib/response-parser';
import { logAnalysis } from '../../../lib/resume-service';
import { consumeFeatureUsage, refundFeatureUsage } from '../../../lib/subscription-service';

// Add GET handler for testing
export async function GET(request) {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Improve Section API route is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  const startTime = Date.now();
  
  // Get authenticated user
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { status: 'error', error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Extract section type and text from request body
    const { section_type, original_text } = body;
    
    // Validate required fields
    if (!section_type || !original_text) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: 'Both section_type and original_text are required' 
        },
        { status: 400 }
      );
    }

    // Validate section type
    const validSectionTypes = ['summary', 'experience', 'skills', 'education', 'projects'];
    if (!validSectionTypes.includes(section_type.toLowerCase())) {
      return NextResponse.json(
        { 
          status: 'error', 
          error: `Invalid section type. Must be one of: ${validSectionTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Reserve quota atomically. Checks and increments in a single statement so
    // parallel requests cannot all pass the same check. Every failure path
    // below refunds the reservation.
    const accessCheck = await consumeFeatureUsage(userId, 'improve', {
      sectionType: section_type.toLowerCase(),
      originalLength: original_text.length,
    });
    if (!accessCheck.allowed) {
      return NextResponse.json(
        {
          status: 'LIMIT_REACHED',
          error: accessCheck.message,
          used: accessCheck.used,
          remaining: accessCheck.remaining,
          limit: accessCheck.limit,
          tier: accessCheck.tier,
          resetDate: accessCheck.resetDate,
        },
        { status: 429 }
      );
    }

    try {
      console.log(`Improving ${section_type} section with Gemini API`);
      const geminiResponse = await improveResumeSectionWithGemini(
        section_type.toLowerCase(), 
        original_text
      );
      
      console.log('Parsing Gemini response');
      const improvementResult = parseGeminiResponse(geminiResponse);

      // parseGeminiResponse never throws: on a malformed model reply it returns
      // an object carrying status 'error'. Detect that before overwriting the
      // status below, otherwise a parse failure is served as a success.
      if (improvementResult?.status === 'error') {
        console.error('Failed to parse section improvement response');
        await refundFeatureUsage(userId, 'improve');
        return NextResponse.json(
          { status: 'error', error: 'Could not read the improvement result. Please try again.' },
          { status: 502 }
        );
      }

      // Add status key to the response
      if (typeof improvementResult === 'object' && improvementResult !== null) {
        improvementResult.status = 'success';

        const durationMs = Date.now() - startTime;

        // Usage was already reserved before the improvement ran.
        
        // Log the analysis
        try {
          await logAnalysis({
            clerkUserId: userId,
            modelUsed: 'gemini-2.5-flash',
            analysisType: 'section_improvement',
            sectionType: section_type.toLowerCase(),
            success: true,
            durationMs: durationMs,
          });
        } catch (dbError) {
          console.error('Database log error (non-blocking):', dbError);
        }
        
        // Log basic info about the result
        console.log(`Section improvement complete - Score: ${improvementResult.improvement_score || 'N/A'}`);
        return NextResponse.json(improvementResult);
      } else {
        console.error('Invalid response format from section improvement');
        await refundFeatureUsage(userId, 'improve');
        return NextResponse.json(
          { status: 'error', error: 'Invalid response format from section improvement' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Section improvement error:', error);

      // The improvement failed, so give the reserved quota back.
      await refundFeatureUsage(userId, 'improve');

      // Log failed analysis
      try {
        await logAnalysis({
          clerkUserId: userId,
          modelUsed: 'gemini-2.5-flash',
          analysisType: 'section_improvement',
          sectionType: section_type?.toLowerCase(),
          success: false,
          errorMessage: error.message,
          durationMs: Date.now() - startTime,
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
      
      return NextResponse.json(
        { status: 'error', error: `Section improvement error: ${error.message}` },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { status: 'error', error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
}