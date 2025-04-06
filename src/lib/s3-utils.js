// src/lib/s3-utils.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import config from './config';

// Initialize S3 client
export const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  }
});

/**
 * Upload a video to S3
 * @param {Buffer} fileBuffer The video file buffer
 * @param {string} fileName The name to save the file as
 * @param {string} contentType The content type of the file
 * @param {Object} metadata Additional metadata to store with the file
 * @returns {Promise<Object>} Upload result with URL and key
 */
export async function uploadVideoToS3(fileBuffer, fileName, contentType = 'video/mp4', metadata = {}) {
  const key = `videos/${fileName}`;
  
  // Convert metadata to string values as required by S3
  const stringMetadata = {};
  Object.entries(metadata).forEach(([key, value]) => {
    stringMetadata[key] = String(value);
  });
  
  const params = {
    Bucket: config.aws.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: stringMetadata,
  };
  
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    return {
      url: `https://${config.aws.bucketName}.s3.amazonaws.com/${key}`,
      key,
      contentType,
      metadata: stringMetadata,
    };
  } catch (error) {
    console.error('Error uploading video to S3:', error);
    throw new Error('Failed to upload video');
  }
}

/**
 * Get a file from S3
 * @param {string} key The S3 key of the file
 * @returns {Promise<Object>} The file data and metadata
 */
export async function getFileFromS3(key) {
  const params = {
    Bucket: config.aws.bucketName,
    Key: key,
  };
  
  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    
    const bodyContents = await streamToBuffer(response.Body);
    
    return {
      data: bodyContents,
      contentType: response.ContentType,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw new Error('Failed to get file from S3');
  }
}

/**
 * Convert a readable stream to a buffer
 * @param {ReadableStream} stream Stream to convert
 * @returns {Promise<Buffer>} Buffer containing the stream data
 */
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Generate a signed URL for temporary access to an S3 object
 * @param {string} key The S3 key of the file
 * @param {number} expirationSeconds How long the URL should be valid (in seconds)
 * @returns {Promise<string>} The signed URL
 */
export async function getSignedUrl(key, expirationSeconds = 3600) {
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  
  const command = new GetObjectCommand({
    Bucket: config.aws.bucketName,
    Key: key,
  });
  
  try {
    return await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Check if mock services should be used
 * @returns {boolean} True if mock services should be used
 */
export function useMockServices() {
  return config.app.useMockServices || config.isDevelopment;
}