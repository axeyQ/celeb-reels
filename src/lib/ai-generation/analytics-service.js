// src/lib/ai-generation/analytics-service.js
import config from '../config';

// In-memory analytics storage for development
// In production, this would be stored in a database
const analyticsData = {
  generationCount: 0,
  successCount: 0,
  failureCount: 0,
  averageProcessingTime: 0,
  totalProcessingTime: 0,
  generationsByAthlete: {},
  generationsBySport: {},
  generationsByFocus: {},
  generationsByStatus: {
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  },
  generationTimeline: [],
};

/**
 * Track a new generation job
 * @param {Object} jobData The job data
 * @returns {Object} Updated analytics data
 */
export function trackGenerationStart(jobData) {
  const { athlete, sport, focus } = jobData;
  
  analyticsData.generationCount++;
  analyticsData.generationsByStatus.queued++;
  
  // Track by athlete
  if (!analyticsData.generationsByAthlete[athlete]) {
    analyticsData.generationsByAthlete[athlete] = 0;
  }
  analyticsData.generationsByAthlete[athlete]++;
  
  // Track by sport
  if (!analyticsData.generationsBySport[sport]) {
    analyticsData.generationsBySport[sport] = 0;
  }
  analyticsData.generationsBySport[sport]++;
  
  // Track by focus
  if (focus && !analyticsData.generationsByFocus[focus]) {
    analyticsData.generationsByFocus[focus] = 0;
  }
  if (focus) {
    analyticsData.generationsByFocus[focus]++;
  }
  
  // Add to timeline
  analyticsData.generationTimeline.push({
    timestamp: new Date().toISOString(),
    event: 'start',
    athlete,
    sport,
    focus,
  });
  
  // In production, this would be stored in a database
  // For development, it's just in memory
  return { ...analyticsData };
}

/**
 * Track a generation status change
 * @param {string} jobId The job ID
 * @param {string} oldStatus The previous status
 * @param {string} newStatus The new status
 * @returns {Object} Updated analytics data
 */
export function trackStatusChange(jobId, oldStatus, newStatus) {
  if (oldStatus && analyticsData.generationsByStatus[oldStatus]) {
    analyticsData.generationsByStatus[oldStatus]--;
  }
  
  if (analyticsData.generationsByStatus[newStatus] !== undefined) {
    analyticsData.generationsByStatus[newStatus]++;
  }
  
  // Add to timeline
  analyticsData.generationTimeline.push({
    timestamp: new Date().toISOString(),
    event: 'status_change',
    jobId,
    oldStatus,
    newStatus,
  });
  
  return { ...analyticsData };
}

/**
 * Track a completed generation job
 * @param {string} jobId The job ID
 * @param {boolean} success Whether the generation was successful
 * @param {number} processingTime Processing time in milliseconds
 * @param {Object} result The generation result
 * @returns {Object} Updated analytics data
 */
export function trackGenerationComplete(jobId, success, processingTime, result = {}) {
  if (success) {
    analyticsData.successCount++;
  } else {
    analyticsData.failureCount++;
  }
  
  // Update processing time metrics
  analyticsData.totalProcessingTime += processingTime;
  analyticsData.averageProcessingTime = 
    analyticsData.totalProcessingTime / (analyticsData.successCount + analyticsData.failureCount);
  
  // Add to timeline
  analyticsData.generationTimeline.push({
    timestamp: new Date().toISOString(),
    event: 'complete',
    jobId,
    success,
    processingTime,
    result: config.isDevelopment ? result : undefined, // Only include result in development
  });
  
  // Limit timeline to prevent memory issues in development
  if (analyticsData.generationTimeline.length > 1000) {
    analyticsData.generationTimeline = analyticsData.generationTimeline.slice(-1000);
  }
  
  return { ...analyticsData };
}

/**
 * Get analytics data
 * @returns {Object} Analytics data
 */
export function getAnalytics() {
  return { ...analyticsData };
}

/**
 * Get top athletes by generation count
 * @param {number} limit Maximum number of results
 * @returns {Array} Top athletes
 */
export function getTopAthletes(limit = 10) {
  return Object.entries(analyticsData.generationsByAthlete)
    .map(([athlete, count]) => ({ athlete, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get top sports by generation count
 * @param {number} limit Maximum number of results
 * @returns {Array} Top sports
 */
export function getTopSports(limit = 10) {
  return Object.entries(analyticsData.generationsBySport)
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculate success rate
 * @returns {number} Success rate percentage
 */
export function getSuccessRate() {
  const total = analyticsData.successCount + analyticsData.failureCount;
  if (total === 0) return 0;
  return (analyticsData.successCount / total) * 100;
}

/**
 * Reset analytics data (for testing)
 */
export function resetAnalytics() {
  analyticsData.generationCount = 0;
  analyticsData.successCount = 0;
  analyticsData.failureCount = 0;
  analyticsData.averageProcessingTime = 0;
  analyticsData.totalProcessingTime = 0;
  analyticsData.generationsByAthlete = {};
  analyticsData.generationsBySport = {};
  analyticsData.generationsByFocus = {};
  analyticsData.generationsByStatus = {
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };
  analyticsData.generationTimeline = [];
}