import { NextRequest, NextResponse } from 'next/server';
import { analyzeResumeOverallWithGemini } from '../../../lib/gemini-service';
import { extractTextFromPdf } from '../../../lib/pdf-extractor';
import { parseGeminiResponse } from '../../../lib/response-parser';

// Add GET handler for testing
export async function GET(request) {
  return NextResponse.json({ 
    status: 'success', 
    message: 'Analyze Overall API route is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
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

    // Extract text from PDF
    let resumeText;
    try {
      const pdfBuffer = Buffer.from(await resumeFile.arrayBuffer());
      resumeText = await extractTextFromPdf(pdfBuffer);
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