import { track } from '@vercel/analytics';

// Custom analytics tracking functions
export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined') {
    track(eventName, properties);
  }
};

// Specific event tracking functions for your resume analyzer
export const trackResumeUpload = (fileSize, fileType) => {
  trackEvent('resume_uploaded', {
    file_size_kb: Math.round(fileSize / 1024),
    file_type: fileType,
    timestamp: new Date().toISOString()
  });
};

export const trackAnalysisStart = (hasJobDescription) => {
  trackEvent('analysis_started', {
    has_job_description: hasJobDescription,
    timestamp: new Date().toISOString()
  });
};

export const trackAnalysisComplete = (score, duration) => {
  trackEvent('analysis_completed', {
    resume_score: score,
    analysis_duration_ms: duration,
    timestamp: new Date().toISOString()
  });
};

export const trackAnalysisError = (errorType, errorMessage) => {
  trackEvent('analysis_error', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100), // Limit message length
    timestamp: new Date().toISOString()
  });
};

export const trackSectionImprovement = (sectionType, originalLength, improvedLength) => {
  trackEvent('section_improved', {
    section_type: sectionType,
    original_length: originalLength,
    improved_length: improvedLength,
    improvement_ratio: (improvedLength / originalLength).toFixed(2),
    timestamp: new Date().toISOString()
  });
};

export const trackPageView = (pageName, additionalProps = {}) => {
  trackEvent('page_viewed', {
    page_name: pageName,
    ...additionalProps,
    timestamp: new Date().toISOString()
  });
};

export const trackFeatureUsage = (feature, action = 'used') => {
  trackEvent('feature_usage', {
    feature_name: feature,
    action: action,
    timestamp: new Date().toISOString()
  });
};