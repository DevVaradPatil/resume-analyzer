import { NextRequest, NextResponse } from 'next/server';
import { analyzeResumeWithGemini } from '../../../lib/gemini-service';
import { extractTextFromPdf } from '../../../lib/pdf-extractor';
import { parseGeminiResponse } from '../../../lib/response-parser';

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
      const pdfBuffer = Buffer.from(await resumeFile.arrayBuffer());
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