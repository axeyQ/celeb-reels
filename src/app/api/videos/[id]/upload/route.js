import { NextResponse } from 'next/server';
import { uploadVideoToS3 } from '@/lib/s3-utils';

/**
 * POST handler to upload a video to S3
 * @param {Request} request - The incoming request with FormData
 * @returns {Promise<NextResponse>} - The response with upload status
 */
export async function POST(request) {
  try {
    // Get the form data
    const formData = await request.formData();
    
    // Get the video file from the form
    const videoFile = formData.get('video');
    
    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }
    
    // Get other metadata from the form
    const title = formData.get('title') || 'Untitled Video';
    const description = formData.get('description') || '';
    const athlete = formData.get('athlete') || '';
    const sport = formData.get('sport') || 'Uncategorized';
    const thumbnailUrl = formData.get('thumbnailUrl') || '';
    const duration = formData.get('duration') || '00:00';
    
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = videoFile.name.split('.').pop();
    const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.${fileExtension}`;
    
    // Convert file to buffer
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    
    // Upload to S3 with metadata
    const uploadResult = await uploadVideoToS3(
      buffer,
      fileName,
      videoFile.type,
      {
        title,
        description,
        athlete,
        sport,
        thumbnailUrl,
        duration,
        uploadedAt: new Date().toISOString(),
        views: '0',
        likes: '0',
      }
    );
    
    return NextResponse.json({
      success: true,
      fileName,
      key: uploadResult.key,
      message: 'Video uploaded successfully',
    });
    
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}

// Increase the maximum request body size for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};