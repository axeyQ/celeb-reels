import { NextResponse } from 'next/server';
import { getVideoPresignedUrl, getVideoMetadata } from '@/lib/s3-utils';
import { mockVideos } from '@/data/mockVideos';

/**
 * GET handler to fetch a specific video by ID
 * @param {Request} request - The incoming request
 * @param {Object} params - Route parameters containing video ID
 * @returns {Promise<NextResponse>} - The response with video data
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // In development, use mock data
    if (process.env.NODE_ENV === 'development') {
      const video = mockVideos.find(v => v.id === id);
      
      if (!video) {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        );
      }
      
      // Simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return NextResponse.json(video);
    }
    
    // In production, fetch from S3
    const key = `videos/${id}`;
    
    try {
      const metadata = await getVideoMetadata(key);
      const url = await getVideoPresignedUrl(key);
      
      const video = {
        id: id,
        title: metadata.metadata?.title || 'Untitled Video',
        description: metadata.metadata?.description || '',
        videoUrl: url,
        thumbnailUrl: metadata.metadata?.thumbnailUrl || '',
        duration: metadata.metadata?.duration || '00:00',
        athlete: metadata.metadata?.athlete || 'Unknown Athlete',
        sport: metadata.metadata?.sport || 'Uncategorized',
        views: parseInt(metadata.metadata?.views || '0'),
        likes: parseInt(metadata.metadata?.likes || '0'),
        lastModified: metadata.lastModified,
      };
      
      return NextResponse.json(video);
    } catch (error) {
      // If we got a NoSuchKey error, the video doesn't exist
      if (error.name === 'NoSuchKey') {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        );
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}