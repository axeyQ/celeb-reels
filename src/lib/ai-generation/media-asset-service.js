// src/lib/ai-generation/media-asset-service.js
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../s3-utils';

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const TEMP_DIR = path.join(process.cwd(), 'tmp');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch (error) {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

/**
 * Source images for a video based on search terms
 * @param {Object} params - Image search parameters
 * @param {string[]} params.searchTerms - List of search terms
 * @param {string} params.athlete - Athlete name
 * @param {string} params.sport - Sport name
 * @param {number} params.count - Number of images to source
 * @returns {Promise<Array>} - Array of image metadata objects
 */
export async function sourceImages({
  searchTerms = [],
  athlete,
  sport,
  count = 10,
}) {
  // In a production environment, you would integrate with a licensed stock image API
  // or a sports media content provider. For this example, we'll use a placeholder approach.
  
  try {
    // Combine search terms with athlete and sport for better results
    const combinedTerms = [
      ...searchTerms,
      `${athlete} ${sport}`,
      `${athlete} action`,
      `${athlete} career highlight`,
    ];
    
    const images = [];
    
    // In a real implementation, you would make API calls to image providers
    // For demo purposes, we'll create placeholder metadata
    for (let i = 0; i < count; i++) {
      const searchTerm = combinedTerms[i % combinedTerms.length];
      
      images.push({
        id: `img_${Date.now()}_${i}`,
        searchTerm,
        originalUrl: `https://placehold.co/1080x1920/111827/FFFFFF/png?text=${encodeURIComponent(searchTerm)}`,
        athlete,
        sport,
        sourceType: 'placeholder', // In production: 'getty', 'shutterstock', etc.
        attribution: 'Demo Placeholder', // In production: actual attribution
        licenseInfo: 'Demo License', // In production: actual license details
        timestamp: new Date().toISOString(),
      });
    }
    
    // Process and store these images
    return await processAndStoreImages(images);
  } catch (error) {
    console.error('Error sourcing images:', error);
    throw new Error('Failed to source images');
  }
}

/**
 * Process and store images in S3
 * @param {Array} images - Array of image metadata
 * @returns {Promise<Array>} - Array of processed image metadata
 */
async function processAndStoreImages(images) {
  await ensureTempDir();
  
  const processedImages = [];
  
  for (const image of images) {
    try {
      // Download the image
      const tempFilePath = path.join(TEMP_DIR, `${image.id}.jpg`);
      
      // In a real implementation, download the actual image
      // For demo purposes, we'll download a placeholder
      const response = await axios.get(image.originalUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(tempFilePath, Buffer.from(response.data));
      
      // Process the image using sharp
      const processedBuffer = await processImage(tempFilePath);
      
      // Upload to S3
      const s3Key = `images/${image.athlete.replace(/\s+/g, '-').toLowerCase()}/${image.id}.jpg`;
      await uploadImageToS3(processedBuffer, s3Key);
      
      // Add processed image metadata
      processedImages.push({
        ...image,
        processedUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`,
        s3Key,
      });
      
      // Clean up temp file
      await fs.unlink(tempFilePath);
    } catch (error) {
      console.error(`Error processing image ${image.id}:`, error);
      // Continue with next image
    }
  }
  
  return processedImages;
}

/**
 * Process an image for optimal video use
 * @param {string} filePath - Path to the image file
 * @returns {Promise<Buffer>} - Processed image buffer
 */
async function processImage(filePath) {
  try {
    // Read the image
    const imageBuffer = await fs.readFile(filePath);
    
    // Process with sharp for mobile-first vertical video format
    return await sharp(imageBuffer)
      .resize({
        width: 1080, // Standard vertical video width
        height: 1920, // Standard vertical video height
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 }) // Optimize for quality and file size
      .toBuffer();
  } catch (error) {
    console.error('Error processing image with sharp:', error);
    throw error;
  }
}

/**
 * Upload an image to S3
 * @param {Buffer} imageBuffer - The image data
 * @param {string} key - The S3 key
 * @returns {Promise<void>}
 */
async function uploadImageToS3(imageBuffer, key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
  };
  
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw error;
  }
}

/**
 * Track attribution for image usage
 * @param {Object} params - Attribution parameters
 * @param {Array} params.images - Used images metadata
 * @param {string} params.videoId - ID of the video using the images
 * @returns {Promise<Object>} - Attribution record
 */
export async function trackAttribution({
  images,
  videoId,
}) {
  // In a production system, you would store this in a database
  // For this example, we'll store a JSON file in S3
  
  const attributionRecord = {
    videoId,
    timestamp: new Date().toISOString(),
    images: images.map(img => ({
      imageId: img.id,
      searchTerm: img.searchTerm,
      source: img.sourceType,
      attribution: img.attribution,
      licenseInfo: img.licenseInfo,
    })),
  };
  
  const key = `attribution/${videoId}.json`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(attributionRecord, null, 2),
    ContentType: 'application/json',
  };
  
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    return {
      ...attributionRecord,
      s3Key: key,
    };
  } catch (error) {
    console.error('Error storing attribution data:', error);
    throw new Error('Failed to track attribution');
  }
}