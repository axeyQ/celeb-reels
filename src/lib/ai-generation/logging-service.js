// src/lib/ai-generation/logging-service.js
import config from '../config';

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

// Minimum log level to record (configurable via environment)
const MIN_LOG_LEVEL = LOG_LEVELS[process.env.MIN_LOG_LEVEL || 'INFO'];

// In-memory log storage for development
const memoryLogs = [];

/**
 * Log a message with the specified level
 * @param {string} level The log level ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')
 * @param {string} message The log message
 * @param {Object} [data] Additional data to log
 * @param {Error} [error] Error object if applicable
 */
function log(level, message, data = {}, error = null) {
  const levelValue = LOG_LEVELS[level];
  
  // Skip if log level is below minimum
  if (levelValue < MIN_LOG_LEVEL) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data,
  };
  
  // Add error information if present
  if (error) {
    logEntry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  
  // In development, store logs in memory and console
  if (config.isDevelopment) {
    memoryLogs.push(logEntry);
    
    // Limit memory logs to prevent memory leaks
    if (memoryLogs.length > 1000) {
      memoryLogs.shift();
    }
    
    // Console output based on level
    if (level === 'DEBUG') {
      console.debug(`[${timestamp}] [${level}] ${message}`, data, error);
    } else if (level === 'INFO') {
      console.info(`[${timestamp}] [${level}] ${message}`, data);
    } else if (level === 'WARN') {
      console.warn(`[${timestamp}] [${level}] ${message}`, data, error);
    } else {
      console.error(`[${timestamp}] [${level}] ${message}`, data, error);
    }
  } else {
    // In production, would send to a logging service like CloudWatch, Datadog, etc.
    // For now, we'll just console.log
    console.log(JSON.stringify(logEntry));
    
    // In a real implementation, you would use a proper logging service:
    // await sendToLoggingService(logEntry);
  }
  
  return logEntry;
}

// Convenience methods for different log levels
export const debug = (message, data, error) => log('DEBUG', message, data, error);
export const info = (message, data, error) => log('INFO', message, data, error);
export const warn = (message, data, error) => log('WARN', message, data, error);
export const error = (message, data, error) => log('ERROR', message, data, error);
export const fatal = (message, data, error) => log('FATAL', message, data, error);

/**
 * Get all logs (for development/debugging)
 * @returns {Array} Array of log entries
 */
export function getLogs() {
  return [...memoryLogs];
}

/**
 * Clear memory logs (for development/debugging)
 */
export function clearLogs() {
  memoryLogs.length = 0;
}

/**
 * Log a generation pipeline event
 * @param {string} jobId The ID of the generation job
 * @param {string} stage The pipeline stage ('script', 'audio', 'images', 'video', etc.)
 * @param {string} status The status ('start', 'complete', 'error')
 * @param {Object} [data] Additional data to log
 * @param {Error} [error] Error object if applicable
 */
export function logPipelineEvent(jobId, stage, status, data = {}, error = null) {
  const message = `[Job ${jobId}] ${stage} ${status}`;
  const level = status === 'error' ? 'ERROR' : 'INFO';
  
  return log(level, message, { jobId, stage, status, ...data }, error);
}

/**
 * Create a pipeline logger for a specific job
 * @param {string} jobId The ID of the generation job
 * @returns {Object} Logger object with methods for each stage
 */
export function createPipelineLogger(jobId) {
  return {
    jobId,
    
    script: {
      start: (data) => logPipelineEvent(jobId, 'script', 'start', data),
      complete: (data) => logPipelineEvent(jobId, 'script', 'complete', data),
      error: (data, error) => logPipelineEvent(jobId, 'script', 'error', data, error),
    },
    
    audio: {
      start: (data) => logPipelineEvent(jobId, 'audio', 'start', data),
      complete: (data) => logPipelineEvent(jobId, 'audio', 'complete', data),
      error: (data, error) => logPipelineEvent(jobId, 'audio', 'error', data, error),
    },
    
    images: {
      start: (data) => logPipelineEvent(jobId, 'images', 'start', data),
      complete: (data) => logPipelineEvent(jobId, 'images', 'complete', data),
      error: (data, error) => logPipelineEvent(jobId, 'images', 'error', data, error),
    },
    
    video: {
      start: (data) => logPipelineEvent(jobId, 'video', 'start', data),
      complete: (data) => logPipelineEvent(jobId, 'video', 'complete', data),
      error: (data, error) => logPipelineEvent(jobId, 'video', 'error', data, error),
    },
    
    // Generic method for custom stages
    stage: (stage, status, data, error) => logPipelineEvent(jobId, stage, status, data, error),
  };
}

// Export a debug API endpoint for development
export async function handleDebugLogs(req, res) {
  if (!config.isDevelopment) {
    return res.status(404).json({ error: 'Not available in production' });
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ logs: getLogs() });
  }
  
  if (req.method === 'DELETE') {
    clearLogs();
    return res.status(200).json({ message: 'Logs cleared' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}