// src/lib/ai-generation/job-queue-service.js
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../s3-utils';

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const MAX_CONCURRENT_JOBS = 3; // Maximum number of concurrent generation jobs

// In-memory job queue for demo purposes
// In production, use a proper queue system or database
let jobQueue = [];
let activeJobs = [];
let completedJobs = {};

/**
 * Add a new job to the generation queue
 * @param {Object} jobData - Job parameters
 * @returns {Object} - Job metadata with ID
 */
export function addJob(jobData) {
  const jobId = uuidv4();
  const job = {
    id: jobId,
    status: 'queued',
    progress: 0,
    data: jobData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: null,
  };
  
  jobQueue.push(job);
  processQueue();
  
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
  };
}

/**
 * Process the next jobs in the queue
 */
function processQueue() {
  if (jobQueue.length === 0 || activeJobs.length >= MAX_CONCURRENT_JOBS) {
    return;
  }
  
  const job = jobQueue.shift();
  job.status = 'processing';
  job.updatedAt = new Date().toISOString();
  activeJobs.push(job);
  
  // In a real implementation, this would start an async process
  // For demo purposes, we'll use setTimeout to simulate job stages
  
  // Update job to 25% - Script Generation
  setTimeout(() => {
    updateJobProgress(job.id, 25, 'Generating script');
  }, 3000);
  
  // Update job to 50% - Audio Creation
  setTimeout(() => {
    updateJobProgress(job.id, 50, 'Creating narration audio');
  }, 8000);
  
  // Update job to 75% - Image Collection
  setTimeout(() => {
    updateJobProgress(job.id, 75, 'Sourcing and processing images');
  }, 15000);
  
  // Complete job
  setTimeout(() => {
    // In a real implementation, this would contain the result of your video generation
    const mockResult = {
      id: `video-${Date.now()}`,
      title: `${job.data.athlete}'s ${job.data.sport} Highlights`,
      videoUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/videos/sample-${Date.now()}.mp4`,
      thumbnailUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/thumbnails/sample-${Date.now()}.jpg`,
      duration: '00:30',
      athlete: job.data.athlete,
      sport: job.data.sport,
    };
    
    completeJob(job.id, mockResult);
    
    // Process next job in queue
    activeJobs = activeJobs.filter(j => j.id !== job.id);
    processQueue();
  }, 25000);
}

/**
 * Update the progress of a job
 * @param {string} jobId - ID of the job to update
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Status message
 */
function updateJobProgress(jobId, progress, message) {
  const job = activeJobs.find(j => j.id === jobId);
  if (!job) return;
  
  job.progress = progress;
  job.status = 'processing';
  job.statusMessage = message;
  job.updatedAt = new Date().toISOString();
  
  // In a production environment, you might want to save this state to a database
  persistJobState(job);
}

/**
 * Mark a job as complete with results
 * @param {string} jobId - ID of the job to complete
 * @param {Object} result - Job result data
 */
function completeJob(jobId, result) {
  const job = activeJobs.find(j => j.id === jobId);
  if (!job) return;
  
  job.status = 'completed';
  job.progress = 100;
  job.result = result;
  job.statusMessage = 'Video generation complete';
  job.completedAt = new Date().toISOString();
  job.updatedAt = new Date().toISOString();
  
  // Store in completed jobs cache
  completedJobs[jobId] = { ...job };
  
  // In a production environment, save this to a database
  persistJobState(job);
}

/**
 * Mark a job as failed
 * @param {string} jobId - ID of the job that failed
 * @param {string} error - Error message
 */
export function failJob(jobId, error) {
  const job = activeJobs.find(j => j.id === jobId) || 
              jobQueue.find(j => j.id === jobId);
  
  if (!job) return;
  
  job.status = 'failed';
  job.error = error;
  job.updatedAt = new Date().toISOString();
  
  // If this was an active job, remove it
  activeJobs = activeJobs.filter(j => j.id !== jobId);
  
  // Store in completed jobs cache (even though it failed)
  completedJobs[jobId] = { ...job };
  
  // In a production environment, save this to a database
  persistJobState(job);
  
  // Process next job in queue
  processQueue();
}

/**
 * Get the status of a specific job
 * @param {string} jobId - ID of the job to check
 * @returns {Object|null} - Job status data or null if not found
 */
export function getJobStatus(jobId) {
  // Check completed jobs first
  if (completedJobs[jobId]) {
    return completedJobs[jobId];
  }
  
  // Check active jobs
  const activeJob = activeJobs.find(j => j.id === jobId);
  if (activeJob) {
    return {
      id: activeJob.id,
      status: activeJob.status,
      progress: activeJob.progress,
      statusMessage: activeJob.statusMessage,
      createdAt: activeJob.createdAt,
      updatedAt: activeJob.updatedAt,
    };
  }
  
  // Check queued jobs
  const queuedJob = jobQueue.find(j => j.id === jobId);
  if (queuedJob) {
    return {
      id: queuedJob.id,
      status: queuedJob.status,
      progress: 0,
      statusMessage: 'Waiting in queue',
      createdAt: queuedJob.createdAt,
      updatedAt: queuedJob.updatedAt,
    };
  }
  
  return null;
}

/**
 * Get all jobs (for admin dashboard)
 * @returns {Array} - Array of job status objects
 */
export function getAllJobs() {
  const completedJobArray = Object.values(completedJobs);
  
  return [
    ...jobQueue.map(job => ({
      id: job.id,
      status: job.status,
      progress: 0,
      statusMessage: 'Waiting in queue',
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
    ...activeJobs.map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      statusMessage: job.statusMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
    ...completedJobArray.map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      statusMessage: job.statusMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      error: job.error,
    })),
  ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/**
 * Persist job state to S3 (for recovery purposes)
 * @param {Object} job - Job data to persist
 */
async function persistJobState(job) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `jobs/${job.id}.json`,
      Body: JSON.stringify(job, null, 2),
      ContentType: 'application/json',
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error persisting job state:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Retrieve job state from S3 for recovery
 * @param {string} jobId - ID of the job to retrieve
 * @returns {Promise<Object|null>} - Job data or null if not found
 */
export async function getPersistedJobState(jobId) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `jobs/${jobId}.json`,
    };
    
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    
    const bodyContents = await streamToString(response.Body);
    return JSON.parse(bodyContents);
  } catch (error) {
    console.error('Error retrieving job state:', error);
    return null;
  }
}

/**
 * Convert a readable stream to a string
 * @param {ReadableStream} stream - Stream to convert
 * @returns {Promise<string>} - String content
 */
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

/**
 * Retry a failed job
 * @param {string} jobId - ID of the job to retry
 * @returns {Object|null} - New job data or null if original not found
 */
export function retryJob(jobId) {
  const originalJob = completedJobs[jobId];
  if (!originalJob || originalJob.status !== 'failed') {
    return null;
  }
  
  // Create a new job with the same parameters
  const newJobId = addJob(originalJob.data);
  
  // Add reference to original job
  const job = jobQueue.find(j => j.id === newJobId.id);
  if (job) {
    job.retryOf = jobId;
  }
  
  return newJobId;
}

/**
 * Initialize the job queue service
 * This would recover jobs from persistent storage in production
 */
export async function initJobQueue() {
  // In a production environment, this would load saved jobs from a database
  console.log('Job queue service initialized');
}