import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { analyzeResumeWithGemini } from '../../../lib/gemini-service';
import { extractTextFromPdf } from '../../../lib/pdf-extractor';
import { parseGeminiResponse } from '../../../lib/response-parser';
import { saveResumeAnalysis, logAnalysis } from '../../../lib/resume-service';
import { getOrCreateUser } from '../../../lib/user-sync';
import { checkFeatureAccess, recordFeatureUsage, checkFileSize } from '../../../lib/subscription-service';

// Add GET handler for testing
export async function GET(request) {
  try {
    // Test environment variables
    const hasGoogleApiKey = !!process.env.GOOGLE_API_KEY;
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Analyze API route is working',
      timestamp: new Date().toISOString(),
      environment: {
        hasGoogleApiKey,
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error('GET /api/analyze error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error in GET handler',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  console.log('POST /api/analyze - Starting request processing');
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
    // Check environment variables first
    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY environment variable is missing');
      return NextResponse.json(
        { 
          status: 'error', 
          error: 'Server configuration error: Missing API key' 
        },
        { status: 500 }
      );
    }

    console.log('Parsing form data...');
    const formData = await request.formData();
    
    // Check if resume file is present
    const resumeFile = formData.get('resume');
    if (!resumeFile) {
      return NextResponse.json(
        { status: 'error', error: 'No resume file uploaded' },
        { status: 400 }
      );
    }

    // Get file size for subscription check
    const fileBuffer = await resumeFile.arrayBuffer();
    const fileSize = fileBuffer.byteLength;

    // Ensure user exists in database first
    if (user) {
      await getOrCreateUser({
        id: userId,
        emailAddresses: user.emailAddresses,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });
    }

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
    const accessCheck = await checkFeatureAccess(userId, 'analyze');
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

    // Get job description
    const jobDescription = formData.get('job_description') || '';

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

    // Extract text from PDF
    let resumeText;
    try {
      console.log('Converting file to buffer...');
      const pdfBuffer = Buffer.from(fileBuffer);
      console.log('Buffer created, size:', pdfBuffer.length);
      
      console.log('Extracting text from PDF...');
      resumeText = await extractTextFromPdf(pdfBuffer);
      console.log('Successfully extracted text from PDF, length:', resumeText.length);
    } catch (error) {
      console.error('PDF extraction error:', error);
      return NextResponse.json(
        { status: 'error', error: `PDF extraction error: ${error.message}` },
        { status: 400 }
      );
    }

    // Analyze the resume with Gemini
    try {
      console.log('Sending resume to Gemini API for analysis');
      const geminiResponse = await analyzeResumeWithGemini(resumeText, jobDescription);
      
      console.log('Parsing Gemini response');
      const analysisResult = parseGeminiResponse(geminiResponse);
      
      // Add status key to the response
      if (typeof analysisResult === 'object' && analysisResult !== null) {
        analysisResult.status = 'success';
        
        const durationMs = Date.now() - startTime;
        
        // Record feature usage for subscription tracking
        try {
          await recordFeatureUsage(userId, 'analyze', {
            fileName: resumeFile.name,
            fileSize: fileSize,
            score: analysisResult.score,
          });
        } catch (usageError) {
          console.error('Error recording usage (non-blocking):', usageError);
        }
        
        // Save to database (async, don't await to not block response)
        try {
          // Save resume analysis
          const savedResume = await saveResumeAnalysis({
            clerkUserId: userId,
            fileName: resumeFile.name,
            content: resumeText,
            analysisResult: analysisResult,
            analysisType: 'job_match',
            jobDescription: jobDescription,
            score: analysisResult.score,
          });
          
          // Log the analysis
          await logAnalysis({
            clerkUserId: userId,
            resumeId: savedResume?.id,
            rawInput: resumeText.substring(0, 5000), // Limit stored text
            jobDescription: jobDescription?.substring(0, 2000),
            modelUsed: 'gemini-2.5-flash',
            analysisType: 'job_match',
            success: true,
            durationMs: durationMs,
          });
        } catch (dbError) {
          console.error('Database error (non-blocking):', dbError);
          // Continue with response even if DB save fails
        }
        
        // Log basic info about the result
        console.log(`Analysis complete - Score: ${analysisResult.score || 'N/A'}`);
        return NextResponse.json(analysisResult);
      } else {
        console.error('Invalid response format from analysis');
        return NextResponse.json(
          { status: 'error', error: 'Invalid response format from analysis' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Log failed analysis
      try {
        await logAnalysis({
          clerkUserId: userId,
          rawInput: resumeText?.substring(0, 5000),
          jobDescription: jobDescription?.substring(0, 2000),
          modelUsed: 'gemini-2.5-flash',
          analysisType: 'job_match',
          success: false,
          errorMessage: error.message,
          durationMs: Date.now() - startTime,
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
      
      return NextResponse.json(
        { status: 'error', error: `Analysis error: ${error.message}` },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error in POST /api/analyze:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        status: 'error', 
        error: `Unexpected error: ${error.message}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}