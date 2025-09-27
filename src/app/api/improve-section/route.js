import { NextRequest, NextResponse } from 'next/server';
import { improveResumeSectionWithGemini } from '../../../lib/gemini-service';
import { parseGeminiResponse } from '../../../lib/response-parser';

export async function POST(request) {
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

    try {
      console.log(`Improving ${section_type} section with Gemini API`);
      const geminiResponse = await improveResumeSectionWithGemini(
        section_type.toLowerCase(), 
        original_text
      );
      
      console.log('Parsing Gemini response');
      const improvementResult = parseGeminiResponse(geminiResponse);
      
      // Add status key to the response
      if (typeof improvementResult === 'object' && improvementResult !== null) {
        improvementResult.status = 'success';
        
        // Log basic info about the result
        console.log(`Section improvement complete - Score: ${improvementResult.improvement_score || 'N/A'}`);
        return NextResponse.json(improvementResult);
      } else {
        console.error('Invalid response format from section improvement');
        return NextResponse.json(
          { status: 'error', error: 'Invalid response format from section improvement' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Section improvement error:', error);
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