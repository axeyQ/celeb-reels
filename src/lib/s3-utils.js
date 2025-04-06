import { 
    GetObjectCommand, 
    PutObjectCommand, 
    ListObjectsV2Command,
    DeleteObjectCommand 
  } from '@aws-sdk/client-s3';
  import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
  import { s3Client } from './aws-config';
  
  const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
  
  /**
   * Upload a video file to S3
   * @param {Buffer} fileBuffer - The file buffer to upload
   * @param {string} fileName - The name to give the file in S3
   * @param {string} contentType - The content type of the file
   * @param {Object} metadata - Additional metadata for the video
   * @returns {Promise<Object>} - The result of the upload operation
   */
  export async function uploadVideoToS3(fileBuffer, fileName, contentType, metadata = {}) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `videos/${fileName}`,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: metadata,
    };
  
    try {
      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);
      
      return {
        success: true,
        key: params.Key,
        response
      };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }
  
  /**
   * Get a presigned URL for a video in S3
   * @param {string} key - The S3 key of the video
   * @param {number} expiresIn - Number of seconds until the URL expires
   * @returns {Promise<string>} - The presigned URL
   */
  export async function getVideoPresignedUrl(key, expiresIn = 3600) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };
  
    try {
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, { expiresIn });
      
      return url;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }
  
  /**
   * List all videos in the S3 bucket
   * @param {string} prefix - Optional prefix to filter videos
   * @returns {Promise<Array>} - Array of video objects
   */
  export async function listVideosFromS3(prefix = 'videos/') {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    };
  
    try {
      const command = new ListObjectsV2Command(params);
      const response = await s3Client.send(command);
      
      // Map the S3 objects to a more usable format
      const videos = response.Contents?.map(item => ({
        key: item.Key,
        lastModified: item.LastModified,
        size: item.Size,
        eTag: item.ETag,
      })) || [];
      
      return videos;
    } catch (error) {
      console.error('Error listing videos from S3:', error);
      throw error;
    }
  }
  
  /**
   * Get video metadata from S3
   * @param {string} key - The S3 key of the video
   * @returns {Promise<Object>} - The video metadata
   */
  export async function getVideoMetadata(key) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };
  
    try {
      const command = new GetObjectCommand(params);
      const response = await s3Client.send(command);
      
      return {
        contentType: response.ContentType,
        metadata: response.Metadata,
        lastModified: response.LastModified,
        contentLength: response.ContentLength,
      };
    } catch (error) {
      console.error('Error getting video metadata:', error);
      throw error;
    }
  }
  
  /**
   * Delete a video from S3
   * @param {string} key - The S3 key of the video to delete
   * @returns {Promise<Object>} - The result of the delete operation
   */
  export async function deleteVideoFromS3(key) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };
  
    try {
      const command = new DeleteObjectCommand(params);
      const response = await s3Client.send(command);
      
      return {
        success: true,
        response
      };
    } catch (error) {
      console.error('Error deleting video from S3:', error);
      throw error;
    }
  }