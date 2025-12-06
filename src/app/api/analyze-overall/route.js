import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { analyzeResumeOverallWithGemini } from '../../../lib/gemini-service';
import { extractTextFromPdf } from '../../../lib/pdf-extractor';
import { parseGeminiResponse } from '../../../lib/response-parser';
import { saveResumeAnalysis, logAnalysis } from '../../../lib/resume-service';
import { getOrCreateUser } from '../../../lib/user-sync';
import { checkFeatureAccess, recordFeatureUsage, checkFileSize } from '../../../lib/subscription-service';

// Add GET handler for testing
export async function GET(request) {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Analyze Overall API route is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  const startTime = Date.now();
  
  // Get authenticated user
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return NextResponse.json(
      { status: 'error', error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const formData = await request.formData();
    
    // Check if resume file is present
    const resumeFile = formData.get('resume');
    if (!resumeFile) {
      return NextResponse.json(
        { status: 'error', error: 'No resume file uploaded' },
        { status: 400 }
      );
    }

    // Validate file
    if (!resumeFile.name || resumeFile.name === '') {
      return NextResponse.json(
        { status: 'error', error: 'No file selected' },
        { status: 400 }
      );
    }

    // Check if the file is a PDF
    if (!resumeFile.name.endsWith('.pdf') && resumeFile.type !== 'application/pdf') {
      return NextResponse.json(
        { status: 'error', error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Read file buffer for size check and PDF extraction
    const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const fileSize = fileBuffer.length;

    // Check file size against subscription limits
    const fileSizeCheck = await checkFileSize(userId, fileSize);
    if (!fileSizeCheck.allowed) {
      return NextResponse.json(
        { 
          status: 'FILE_TOO_LARGE', 
          error: fileSizeCheck.message,
          maxSize: fileSizeCheck.maxSize,
          currentSize: fileSize,
          tier: fileSizeCheck.tier,
        },
        { status: 413 }
      );
    }

    // Check feature access (usage limits)
    const accessCheck = await checkFeatureAccess(userId, 'analytics');
    if (!accessCheck.allowed) {
      return NextResponse.json(
        {
          status: 'LIMIT_REACHED',
          error: accessCheck.message,
          remaining: accessCheck.remaining,
          limit: accessCheck.limit,
          tier: accessCheck.tier,
          resetDate: accessCheck.resetDate,
        },
        { status: 429 }
      );
    }

    // Extract text from PDF
    let resumeText;
    try {
      resumeText = await extractTextFromPdf(fileBuffer);
      console.log('Successfully extracted text from PDF');
    } catch (error) {
      console.error('PDF extraction error:', error);
      return NextResponse.json(
        { status: 'error', error: `PDF extraction error: ${error.message}` },
        { status: 400 }
      );
    }

    // Analyze the resume with Gemini
    try {
      console.log('Sending resume to Gemini API for overall analysis');
      const geminiResponse = await analyzeResumeOverallWithGemini(resumeText);
      
      console.log('Parsing Gemini response');
      const analysisResult = parseGeminiResponse(geminiResponse);
      
      // Add status key to the response
      if (typeof analysisResult === 'object' && analysisResult !== null) {
        analysisResult.status = 'success';
        
        const durationMs = Date.now() - startTime;
        
        // Record feature usage for subscription tracking
        try {
          await recordFeatureUsage(userId, 'analytics', {
            fileName: resumeFile.name,
            fileSize: fileSize,
            score: analysisResult.overall_score,
          });
        } catch (usageError) {
          console.error('Error recording usage (non-blocking):', usageError);
        }
        
        // Save to database
        try {
          // Save resume analysis
          const savedResume = await saveResumeAnalysis({
            clerkUserId: userId,
            fileName: resumeFile.name,
            content: resumeText,
            analysisResult: analysisResult,
            analysisType: 'overall',
            score: analysisResult.overall_score,
          });
          
          // Log the analysis
          await logAnalysis({
            clerkUserId: userId,
            resumeId: savedResume?.id,
            rawInput: resumeText.substring(0, 5000),
            modelUsed: 'gemini-2.5-flash',
            analysisType: 'overall',
            success: true,
            durationMs: durationMs,
          });
        } catch (dbError) {
          console.error('Database error (non-blocking):', dbError);
        }
        
        // Log basic info about the result
        console.log(`Overall analysis complete - Score: ${analysisResult.overall_score || 'N/A'}`);
        return NextResponse.json(analysisResult);
      } else {
        console.error('Invalid response format from overall analysis');
        return NextResponse.json(
          { status: 'error', error: 'Invalid response format from overall analysis' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Overall analysis error:', error);
      
      // Log failed analysis
      try {
        await logAnalysis({
          clerkUserId: userId,
          rawInput: resumeText?.substring(0, 5000),
          modelUsed: 'gemini-2.5-flash',
          analysisType: 'overall',
          success: false,
          errorMessage: error.message,
          durationMs: Date.now() - startTime,
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
      
      return NextResponse.json(
        { status: 'error', error: `Overall analysis error: ${error.message}` },
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