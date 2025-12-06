import { getSupabaseAdminClient } from './supabaseClient';
import { getUserByClerkId, getOrCreateUser } from './user-sync';

/**
 * Saves a resume and its analysis result to the database.
 * 
 * @param {Object} params - The parameters for saving the resume
 * @param {string} params.clerkUserId - The Clerk user ID
 * @param {Object} params.clerkUser - Full Clerk user object (for auto-creation)
 * @param {string} params.fileName - The name of the uploaded file
 * @param {string} params.content - The extracted text content from the resume
 * @param {Object} params.analysisResult - The analysis result from Gemini
 * @param {string} params.analysisType - Type of analysis: 'job_match', 'overall', 'section_improvement'
 * @param {string} params.jobDescription - Job description (for job_match analysis)
 * @param {number} params.score - The main score from the analysis
 * @returns {Promise<Object>} The saved resume record
 */
export async function saveResumeAnalysis({
  clerkUserId,
  clerkUser,
  fileName,
  content,
  analysisResult,
  analysisType = 'job_match',
  jobDescription = null,
  score = null,
}) {
  const supabase = getSupabaseAdminClient();
  
  // Get or create user
  let user;
  if (clerkUser) {
    user = await getOrCreateUser(clerkUser);
  } else {
    user = await getUserByClerkId(clerkUserId);
    if (!user) {
      throw new Error('User not found. Please sign in again.');
    }
  }
  
  // Insert resume record
  const { data: resume, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      file_name: fileName,
      content: content,
      analysis_result: analysisResult,
      analysis_type: analysisType,
      job_description: jobDescription,
      score: score,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
  
  return resume;
}

/**
 * Logs an analysis operation to the database.
 * 
 * @param {Object} params - The log parameters
 * @param {string} params.clerkUserId - The Clerk user ID
 * @param {string} params.resumeId - The resume ID (optional)
 * @param {string} params.rawInput - The original resume text
 * @param {string} params.jobDescription - Job description (optional)
 * @param {string} params.modelUsed - The AI model used
 * @param {number} params.tokensUsed - Number of tokens used (optional)
 * @param {string} params.analysisType - Type of analysis
 * @param {string} params.sectionType - Section type for section improvement
 * @param {boolean} params.success - Whether the analysis succeeded
 * @param {string} params.errorMessage - Error message if failed
 * @param {number} params.durationMs - Time taken in milliseconds
 * @returns {Promise<Object>} The log record
 */
export async function logAnalysis({
  clerkUserId,
  resumeId = null,
  rawInput = null,
  jobDescription = null,
  modelUsed = 'gemini-1.5-flash',
  tokensUsed = null,
  analysisType,
  sectionType = null,
  success = true,
  errorMessage = null,
  durationMs = null,
}) {
  const supabase = getSupabaseAdminClient();
  
  // Get user
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    console.warn('User not found for logging, skipping log');
    return null;
  }
  
  const { data, error } = await supabase
    .from('resume_analysis_logs')
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      raw_input: rawInput,
      job_description: jobDescription,
      model_used: modelUsed,
      tokens_used: tokensUsed,
      analysis_type: analysisType,
      section_type: sectionType,
      success: success,
      error_message: errorMessage,
      duration_ms: durationMs,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error logging analysis:', error);
    // Don't throw - logging failures shouldn't break the main flow
    return null;
  }
  
  return data;
}

/**
 * Gets all resumes for a user.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Number of results to skip
 * @returns {Promise<Array>} Array of resume records
 */
export async function getUserResumes(clerkUserId, { limit = 20, offset = 0 } = {}) {
  const supabase = getSupabaseAdminClient();
  
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('resumes')
    .select('id, file_name, analysis_type, score, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Gets a specific resume by ID.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {string} resumeId - The resume ID
 * @returns {Promise<Object|null>} The resume record or null
 */
export async function getResumeById(clerkUserId, resumeId) {
  const supabase = getSupabaseAdminClient();
  
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching resume:', error);
    throw error;
  }
  
  return data || null;
}

/**
 * Deletes a resume by ID.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {string} resumeId - The resume ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteResume(clerkUserId, resumeId) {
  const supabase = getSupabaseAdminClient();
  
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
  
  return true;
}

/**
 * Gets user's analysis statistics.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<Object>} Stats object
 */
export async function getUserStats(clerkUserId) {
  const supabase = getSupabaseAdminClient();
  
  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return {
      totalResumes: 0,
      totalAnalyses: 0,
      averageScore: 0,
      lastAnalysisAt: null,
    };
  }
  
  // Get resume count and average score
  const { data: resumeStats, error: resumeError } = await supabase
    .from('resumes')
    .select('score')
    .eq('user_id', user.id);
  
  if (resumeError) {
    console.error('Error fetching resume stats:', resumeError);
    throw resumeError;
  }
  
  // Get analysis log count
  const { count: analysisCount, error: logError } = await supabase
    .from('resume_analysis_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  if (logError) {
    console.error('Error fetching analysis count:', logError);
  }
  
  // Get last analysis time
  const { data: lastAnalysis } = await supabase
    .from('resume_analysis_logs')
    .select('created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  const scores = resumeStats?.filter(r => r.score != null).map(r => r.score) || [];
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;
  
  return {
    totalResumes: resumeStats?.length || 0,
    totalAnalyses: analysisCount || 0,
    averageScore,
    lastAnalysisAt: lastAnalysis?.created_at || null,
  };
}
