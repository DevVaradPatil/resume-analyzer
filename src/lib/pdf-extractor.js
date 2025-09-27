import pdf from 'pdf-parse';

export async function extractTextFromPdf(pdfBuffer) {
  try {
    console.log('Extracting text from PDF buffer, size:', pdfBuffer.length);
    const data = await pdf(pdfBuffer);
    console.log('PDF parsing successful');
    
    if (!data.text || !data.text.trim()) {
      throw new Error("No text could be extracted from the PDF. The file might be scanned or secured.");
    }
    
    console.log('Text extracted, length:', data.text.length);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}