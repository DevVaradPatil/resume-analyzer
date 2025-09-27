export function parseGeminiResponse(responseText) {
  try {
    // Remove any markdown code block formatting if present
    let cleanedText = responseText.trim();
    
    // Remove ```json and ``` markers if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    
    cleanedText = cleanedText.trim();
    
    // Try to find the JSON object in the response
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON object found in the response");
    }
    
    const jsonString = cleanedText.substring(jsonStart, jsonEnd + 1);
    
    // Parse the JSON
    const parsedResponse = JSON.parse(jsonString);
    
    // Validate that we have the expected structure
    if (typeof parsedResponse !== 'object' || parsedResponse === null) {
      throw new Error("Parsed response is not a valid object");
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    console.error('Raw response:', responseText);
    
    // Return a default error response structure
    return {
      status: "error",
      error: "Failed to parse AI response",
      message: error.message,
      raw_response: responseText
    };
  }
}